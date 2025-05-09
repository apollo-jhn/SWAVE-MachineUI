import signal
import sys
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from app.swave import SWAVE, SWAVE_GPIO, SWAVE_MEMBERSHIP
import os

# Flask
app: Flask = Flask(__name__)
CORS(app)

# SWAVE class
swave: SWAVE = SWAVE()
swave_gpio: SWAVE_GPIO = SWAVE_GPIO()
swave_membership = SWAVE_MEMBERSHIP()

# Signal Handling for Cleanup

# Serve React Frontend


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')


def shutdown_handler(signum, frame) -> None:
    print(f"\n[INFO] Received signal {signum}, cleaning up GPIO...")
    swave_gpio.cleanup()
    sys.exit(0)


# Register signals (Ctrl+C and kill)
signal.signal(signal.SIGINT, shutdown_handler)
signal.signal(signal.SIGTERM, shutdown_handler)


# START: REWARD
@app.route("/membership/addpoints", methods=["POST"])
def add_points():
    try:
        # Get and validate request data
        _data = request.get_json()
        if not _data:
            return jsonify({"message": "No data provided"}), 400

        _code = _data.get("code")
        _points = _data.get("reward_point")
        _bottles = _data.get("bottles")

        if not all([_code, _points is not None, _bottles is not None]):
            return jsonify({"message": "Missing required parameters"}), 400

        # Log received data for debugging
        print(
            f"Adding points - Code: {_code}, Points: {_points}, Bottles: {_bottles}")

        # Call membership function
        success = swave_membership.add_points(_code, _points, _bottles)

        if success:
            # Delete points
            swave.set_reward_points(0.0)
            swave.set_bottle_counter(0)
            return jsonify({"message": "SUCCESS"}), 200
        else:
            return jsonify({"message": "Failed to add points - invalid code or system error"}), 200

    except Exception as e:
        # Log the full error for debugging
        print(f"Error in add_points: {str(e)}", exc_info=True)
        return jsonify({"message": f"Internal server error: {str(e)}"}), 500

# END: MEMBERSHIP


@app.route("/membership/signin", methods=["POST"])
def membership_login():
    try:
        _credential = request.get_json()
        _username = _credential["username"]
        _password = _credential["password"]
        return swave_membership.login(_username, _password)
    except Exception as e:
        return jsonify({"messsage": str(e)}), 500


@app.route("/membership/getdata", methods=["POST"])
def membershipGetData():
    _request = request.get_json()
    if "code" in _request:
        return swave_membership.getData(_request["code"]), 200


@app.route("/redeem/item", methods=["POST"])
def redeem_item():
    try:
        _data = request.get_json()
        _code = _data["code"]
        _itemID = _data["itemId"]
        _pointsCost = _data["pointsCost"]
        swave_membership.redeemItem(_code, _itemID, _pointsCost)
        return jsonify({"message": "OK"}), 200
    except Exception as e:
        return jsonify({"messsage": str(e)}), 500


@app.route("/membership/register", methods=["POST"])
def membership_register():
    try:
        _data = request.get_json()
        _message = swave_membership.register(
            _data["student_number"],
            _data["name"],
            _data["email"],
            _data["password"]
        )
        return jsonify(_message), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

# START: Bottle


@app.route("/recycle/clear", methods=["GET"])
def remove_recycledata():  # To resolve unknown values from the start
    try:
        swave.set_bottle_counter(0)
        swave.set_reward_points(0.0)
        return jsonify({"message": "OK"}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 200

# END: Bottle


@app.route("/warnings", methods=["GET"])
def get_warnings():
    try:
        print(swave.get_warning_fullstorage())
        return jsonify({"is_low_water": swave.get_warning_low_on_water(), "is_storage_full": swave.get_warning_fullstorage()}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500


@app.route("/coinslot/inserted_amount", methods=["GET"])
def get_inserted_amount():
    try:
        return jsonify({"inserted_amount": swave.get_inserted_amount()}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500


@app.route("/buywater/process_order", methods=["POST"])
def process_order():
    try:
        # Save order detais
        data = request.get_json()
        swave.set_selected_volume(data["volume_value"])
        swave.set_selected_price(data["price_value"])

        # Start dispensing
        swave.set_dispensing_state(True)
        print("Dispense start")

        # Check if water is below the minimum serving volume
        swave.calculate_liters_consumed()

        # Remove coinslot values #
        swave.set_inserted_amount(
            swave.get_inserted_amount() - swave.get_selected_price())

        # Return interval
        return jsonify({"message": "OK", "dispensing_interval": swave.calculate_dispensing_interval()}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500


@app.route("/stop/dispensing", methods=["GET"])
def stop_dispensing():
    try:
        # Start dispensing
        swave.set_dispensing_state(False)
        print("Dispense stopped")

        return jsonify({"message": "OK"}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500


@app.route("/recycle/data", methods=["GET"])
def get_recycle_data():
    try:
        return jsonify({
            "message": "OK",
            "inserted_bottles": swave.get_bottle_counter(),
            "reward_points": swave.get_reward_points()
        }), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500


@app.route("/recycle/donate", methods=["GET"])
def recycle_donate_bottles():
    try:
        swave.donate_bottles()
        return jsonify({"messages": "OK"}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500


if __name__ == "__main__":
    # Configure static folder
    app.static_folder = '../dist'  # Assuming your React build is in a 'dist' folder

    swave.main()
    swave_gpio.main(swave)
    print("[INFO] Server starting at http://0.0.0.0:5000")
    app.run(debug=False, port=5000, host="0.0.0.0")
