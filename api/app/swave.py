import threading
import RPi.GPIO as GPIO
import time
import random
import os
import json


class SWAVE_MEMBERSHIP():
    def __init__(self):
        self.DB_FILE = 'database.json'
        self.lock = threading.Lock()

        # Check if the file exists
        if not os.path.exists(self.DB_FILE):
            # Initialize with an empty dict (or list, depending on your structure)
            initial_data = {
                "accounts": [],          # or provide default list here
                "transactions": []
            }
            with open(self.DB_FILE, 'w') as f:
                # or [] if using a list as root dawd
                json.dump(initial_data, f, indent=4)

    def login(self, username, password):
        _db = self.readDatabase()
        for student in _db["accounts"]:
            if (
                student["student_number"] == username
                or student["email"] == username
                or student["code"] == username
            ):
                # Now verify password
                if student["password"] == password:
                    return {
                        "access": "true",
                        "redirectUrl": f"/dashboard/{student['code']}",
                        "code": student[
                            "code"
                        ],  # Also return the code for session management
                    }
                else:
                    # Password doesn't match
                    return {"access": "false", "message": "Invalid password"}

        # No matching account found
        return {"access": "false", "message": "Account not found"}

    def getData(self, code):
        _db = self.readDatabase()
        for student in _db["accounts"]:
            if student["code"] == code:
                return {
                    "points": student["points"],
                    "student_number": student["student_number"],
                    "name": student["name"],
                    "email": student["email"],
                }

        # Only print error if no student found after checking all accounts
        print(f"ERROR: GETDATA ERROR - No student found with code: {code}")
        return None  # Explicitly return None to indicate no match found

    def redeemItem(self, code: str, itemId: int, pointCost: float):
        _db = self.readDatabase()

        # First find if the code exists
        account_found = None
        for account in _db["accounts"]:
            if account["code"] == code:
                account_found = account
                break

        if account_found:
            # Minus the points
            account_found["points"] -= pointCost

            # Write back to the database
            self.writeDatabase(_db)

            # Clear points
            # self.clearBottleDataValues()

            return {
                "message": "Point Added Successfully. Thank you!",
                "status": "success",
            }
        else:
            return {"message": "User code was not found.", "status": "failed"}

    def readDatabase(self) -> dict:
        with self.lock:
            with open(self.DB_FILE, 'r') as f:
                return json.load(f)

    def writeDatabase(self, data):
        with self.lock:
            with open(self.DB_FILE, 'w') as f:
                json.dump(data, f, indent=4)

    # Class membership logic

    def add_points(self, code: str, reward_points: float, bottles: int):
        _database = self.readDatabase()

        # First find if the code exists
        account_found = None
        for account in _database["accounts"]:
            if account["code"] == code:
                account_found = account
                break

        if account_found:
            # Update the points
            account_found["points"] += reward_points
            account_found["bottles"] += bottles
            self.writeDatabase(_database)
            return True
        else:
            return False

    def codeGenerator(self, lower_bound: int = 0, upper_bound: int = 9) -> str:
        # Load database
        _db = self.readDatabase()

        # Get all existing codes first for faster checking
        existing_codes = {
            account["code"] for account in _db["accounts"] if "code" in account
        }

        # Generate a 4-digit code and check for duplicates
        while True:
            # Generate random 4-digit code
            code = "".join(
                str(random.randint(lower_bound, upper_bound)) for _ in range(4)
            )
            if code not in existing_codes:
                return code

    def register(self, student_number: str, name: str, email: str, password: str):
        _db = self.readDatabase()
        for student in _db["accounts"]:
            if student["student_number"] == student_number:
                return {
                    "message": "student number already exist!",
                    "status": "failed",
                }

        _code = self.codeGenerator()

        _new_account = {
            "student_number": student_number,
            "name": name,
            "email": email,
            "password": password,
            "points": 0.0,
            "bottles": 0,
            "code": _code,
        }

        _db["accounts"].append(_new_account)

        # Write the updated database to the file
        self.writeDatabase(_db)

        return {"message": "Registered Thank you!.", "code": _code, "status": "success"}


class SWAVE():
    def __init__(self):
        self.log_bottle_inserted: int = 0
        self.log_gived_rewards: float = 0.0

        # Access lock
        self.lock = threading.Lock()

        # Constants
        self.INTERVAL_PER_1_LITER_MS: float = 30000
        self.MAXIMUM_MILILITERS_TO_BE_SERVED: int = 20000
        self.MINIMUM_MILILITERS_TO_BE_SERVED: int = 2000  # or 2L Just to make sure

        # Temporary Values
        self.liters_left_counter: int = 0

        # Warnings
        self.warning_fullstorage: bool = False
        self.warning_low_on_water: bool = False

        # Coinslot values
        self.inserted_amount: int = 0

        # Buying water selection
        self.selected_volume: int = 0
        self.selected_price: int = 0

        # Recycling
        self.bottle_counter: int = 0
        self.reward_points: float = 0.0

        # Dispense
        self.dispensing_state: bool = False

    # Functions
    def donate_bottles(self):
        # Clear up the vaues
        with self.lock:
            self.log_bottle_inserted += self.bottle_counter
            self.log_gived_rewards += self.reward_points
            self.bottle_counter = 0
            self.reward_points = 0

    def increment_inserted_amount(self):
        with self.lock:
            self.inserted_amount += 1

    def calculate_liters_consumed(self):
        with self.lock:
            _volume = self.selected_volume
            self.liters_left_counter -= _volume
            print(self.liters_left_counter)
            if self.liters_left_counter <= self.MINIMUM_MILILITERS_TO_BE_SERVED:
                self.warning_low_on_water = True

    def calculate_dispensing_interval(self) -> float:
        return (self.selected_volume / 1000) * self.INTERVAL_PER_1_LITER_MS

    # Getters
    def get_selected_price(self):
        with self.lock:
            return self.selected_price

    def get_bottle_counter(self):
        with self.lock:
            return self.bottle_counter

    def get_reward_points(self):
        with self.lock:
            return self.reward_points

    def get_inserted_amount(self):
        with self.lock:
            return self.inserted_amount

    def get_warning_fullstorage(self) -> bool:
        with self.lock:
            return self.warning_fullstorage

    def get_warning_low_on_water(self):
        with self.lock:
            return self.warning_low_on_water

    def get_dispensing_state(self):
        with self.lock:
            return self.dispensing_state

    # Setters
    def set_inserted_amount(self, _value: int) -> None:
        with self.lock:
            self.inserted_amount = _value

    def set_warning_fullstorage(self, _value: bool):
        with self.lock:
            self.warning_fullstorage = _value

    def set_bottle_counter(self, _value: int):
        with self.lock:
            self.bottle_counter = _value

    def set_reward_points(self, _value: float):
        with self.lock:
            self.reward_points = _value

    def set_selected_volume(self, volume: int):
        with self.lock:
            self.selected_volume = volume

    def set_selected_price(self, price: int):
        with self.lock:
            self.selected_price = price

    def set_dispensing_state(self, state: bool):
        with self.lock:
            self.dispensing_state = state

    # Main
    def main(self):
        # Initiliaze value
        self.liters_left_counter = self.MAXIMUM_MILILITERS_TO_BE_SERVED


class SWAVE_GPIO():
    def __init__(self):
        self.swave = None

        # Pin declarations
        self.WATER_PUMP_RELAY: int = 25  # ACTIVE
        self.ULTRASONIC_TRIG: int = 23
        self.ULTRASONIC_ECHO: int = 24
        self.INFRARED_SENSOR_1: int = 17  # ACTIVE
        self.INFRARED_SENSOR_2: int = 27
        self.INFRARED_SENSOR_3: int = 22
        self.COIN_SLOT_SIGNAL: int = 26  # ACTIVE

    def cleanup(self):
        GPIO.cleanup()

    def pin_setup(self):
        # Infrared Sensors
        GPIO.setup(self.INFRARED_SENSOR_2, GPIO.IN)

        # Water pump relay
        GPIO.setup(self.WATER_PUMP_RELAY, GPIO.OUT)
        GPIO.output(self.WATER_PUMP_RELAY, GPIO.LOW)

        # Coin-slot
        GPIO.setup(self.COIN_SLOT_SIGNAL, GPIO.IN, pull_up_down=GPIO.PUD_UP)
        GPIO.add_event_detect(self.COIN_SLOT_SIGNAL, GPIO.RISING,
                              callback=self.increment_amount, bouncetime=20)

        # Infrared Sensor #1 (Bottle Detection & Rewarding)
        GPIO.setup(self.INFRARED_SENSOR_1, GPIO.IN)
        GPIO.add_event_detect(self.INFRARED_SENSOR_1, GPIO.FALLING,
                              callback=self.increment_recycling_data, bouncetime=250)

        # Infrared Sensor #3 (Storage checking)
        GPIO.setup(self.INFRARED_SENSOR_3, GPIO.IN)

        # Ultra-sonic sensor
        GPIO.setup(self.ULTRASONIC_ECHO, GPIO.IN)
        GPIO.setup(self.ULTRASONIC_TRIG, GPIO.OUT)

    def set_warning_storage_full(self):
        if GPIO.input(self.INFRARED_SENSOR_3) == GPIO.LOW:  # Infrared output is inverted
            self.swave.set_warning_fullstorage(True)
        else:
            self.swave.set_warning_fullstorage(False)

    # def ultrasonic_detection(self):
    #     # Set Trigger low for stability
    #     GPIO.output(self.ULTRASONIC_TRIG, False)
    #     time.sleep(0.05)

    #     # Send Trigger pulse
    #     GPIO.output(self.ULTRASONIC_TRIG, True)
    #     time.sleep(0.00001)
    #     GPIO.output(self.ULTRASONIC_TRIG, False)

    #     # Wait for Echo start
    #     while GPIO.input(self.ULTRASONIC_ECHO) == 0:
    #         pulse_start = time.time()

    #     # Wait for Echo end
    #     while GPIO.input(self.ULTRASONIC_ECHO) == 1:
    #         pulse_end = time.time()

    #     # Time difference
    #     pulse_duration = pulse_end - pulse_start

    #     # Distance calculation (34300 cm/s is speed of sound)
    #     distance = pulse_duration * 17150
    #     distance = round(distance, 2)

    #     return distance

    def increment_recycling_data(self, channel):
        # Get the data
        _bottle_count = self.swave.get_bottle_counter()
        _reward_points_count = self.swave.get_reward_points()

        # Set the data
        self.swave.set_bottle_counter(_bottle_count + 1)
        self.swave.set_reward_points(_reward_points_count + random.choices(
            [random.uniform(0.3, 1.25), 2.0], weights=[90, 10])[0])

    def increment_amount(self, channel):
        self.swave.increment_inserted_amount()

    def loop(self):
        while True:
            # Check water pump state
            if self.swave.get_dispensing_state():
                GPIO.output(self.WATER_PUMP_RELAY, GPIO.LOW)
                print("test")
            else:
                GPIO.output(self.WATER_PUMP_RELAY, GPIO.HIGH)

            # Infared Sensor #3
            self.set_warning_storage_full()

            time.sleep(0.01)

    def main(self, _swave: SWAVE):
        # Get the swave class
        self.swave: SWAVE = _swave

        # Setup GPIO
        GPIO.setmode(GPIO.BCM)  # or GPIO.BOARD
        GPIO.setwarnings(False)

        # Run the pin setup
        self.pin_setup()

        # Run loop
        _loop = threading.Thread(target=self.loop, daemon=True)
        _loop.start()
