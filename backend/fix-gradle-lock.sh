#!/bin/bash

echo "Stopping Gradle daemons..."
./gradlew --stop

echo "Killing lingering Gradle processes..."
# Find and kill any process with 'gradle' in the name, excluding the grep itself
pkill -f 'gradle' || echo "No other Gradle processes found."

echo "Gradle lock fixed. You can now run ./gradlew bootRun again."
