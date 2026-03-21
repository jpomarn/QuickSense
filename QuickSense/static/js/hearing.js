// Array of test frequencies (Hz) from low to high
let frequencies = [250, 500, 1000, 2000, 4000, 8000];

// Index of the current frequency being played
let currentIndex = 0;

// Audio context for playing tones
let audioContext;

// Array to store the results of each frequency
let results = [];

// --------------------------
// Start the hearing test
// --------------------------
function startTest() {
    // Hide the "Start" button once the test begins
    document.getElementById("startBtn").style.display = "none";

    // Show the response buttons ("Heard" / "Didn't Hear")
    document.getElementById("responseButtons").style.display = "block";

    // Create a new AudioContext (for sound playback)
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Reset index and results in case of a new test
    currentIndex = 0;
    results = [];

    // Start playing the first tone
    playTone();
}

// --------------------------
// Play a single tone at the current frequency
// --------------------------
function playTone() {
    // If all frequencies have been tested, show final results
    if (currentIndex >= frequencies.length) {
        showResults();
        return;
    }

    let freq = frequencies[currentIndex];

    // Create oscillator and gain nodes for sound
    let oscillator = audioContext.createOscillator();
    let gainNode = audioContext.createGain();

    oscillator.type = "sine"; // pure sine wave
    oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime); // volume

    // Connect nodes and output sound
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Start the tone
    oscillator.start();

    // Stop the tone after 1 second
    setTimeout(() => {
        oscillator.stop();
    }, 1000);

    // Update status text on the page
    document.getElementById("status").innerText = `Playing ${freq} Hz`;
}

// --------------------------
// User clicked "Heard" button
// --------------------------
function heardSound() {
    // Save that the user heard this frequency
    results.push({ freq: frequencies[currentIndex], heard: true });

    // Move to the next frequency
    currentIndex++;

    // Play the next tone
    playTone();
}

// --------------------------
// User clicked "Didn't Hear" button
// --------------------------
function didntHear() {
    // Save that the user did NOT hear this frequency
    results.push({ freq: frequencies[currentIndex], heard: false });

    // Move to the next frequency
    currentIndex++;

    // Play the next tone
    playTone();
}

// --------------------------
// Show final test results
// --------------------------
function showResults() {
    // Filter frequencies the user missed
    let missed = results.filter(r => !r.heard);

    let message;

    // Decide message based on what was missed
    if (missed.length === 0) {
        message = "Great hearing! 🎉"; // No frequencies missed
    } else {
        let missedFreqs = missed.map(r => r.freq).join(", ");
        message = "You may have difficulty hearing: " + missedFreqs + " Hz";
    }

    // Send results to the backend
    fetch("/save_results", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ result: message })
    })
    .then(() => {
        // Redirect user to results page after saving
        window.location.href = "/results";
    });
}