import RPi.GPIO as GPIO
import time

# --- Configuration ---
# Pin numbering mode (BOARD or BCM)
GPIO.setmode(GPIO.BCM)  # Use Broadcom SOC channel numbers
# GPIO.setmode(GPIO.BOARD) # Use physical pin numbering

# Define the GPIO pin you'll be working with
OUTPUT_PIN = 17  # Example: GPIO17 (BCM numbering) or Pin 11 (BOARD numbering)

# Setup function to initialize pins


def setup_gpio():
    try:
        # Set up the output pin as an output
        GPIO.setup(OUTPUT_PIN, GPIO.OUT)
        GPIO.output(OUTPUT_PIN, GPIO.LOW)  # Initialize output to LOW

        print(f"GPIO pin {OUTPUT_PIN} set as OUTPUT")

    except Exception as e:
        print(f"Error during GPIO setup: {e}")

# Cleanup function to reset GPIO settings


def cleanup_gpio():
    GPIO.cleanup()
    print("GPIO cleanup done.")


if __name__ == '__main__':
    try:
        setup_gpio()

        # --- Your main code here ---
        print("Starting main program...")

        # Example: Blink an LED connected to OUTPUT_PIN
        print(f"Blinking LED on pin {OUTPUT_PIN}...")
        for _ in range(5):
            GPIO.output(OUTPUT_PIN, GPIO.HIGH)
            time.sleep(1)
            GPIO.output(OUTPUT_PIN, GPIO.LOW)
            time.sleep(1)

    finally:
        cleanup_gpio()
