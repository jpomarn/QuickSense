// Array of font sizes to test vision (largest to smallest)
let sizes = [40, 30, 24, 18, 14, 10];

// Current index in the sizes array
let index = 0;

// Function to update the text size on the screen
function updateText() {
    // Check if we reached the end of the sizes array
    if (index >= sizes.length) {
        showResult();  // If all sizes are done, show final result
        return;
    }

    // Set the font size of the element with id "testText"
    document.getElementById("testText").style.fontSize = sizes[index] + "px";
}

// Called when user CAN read the current text
function canRead() {
    index++;          // Move to the next (smaller) font size
    updateText();     // Update the displayed text
}

// Called when user CANNOT read the current text
function cantRead() {
    showResult();     // Immediately show result, don't continue smaller sizes
}

// Function to show the final vision test result
function showResult() {
    // Get the current size, or fallback to the smallest if out of bounds
    let size = sizes[index] || sizes[sizes.length - 1];

    let message;

    // Decide message based on smallest readable font
    if (size <= 14) {
        message = "Your vision seems sharp! 👁️"; // Good vision
    } else {
        message = "You may have difficulty reading smaller text."; // Possible vision difficulty
    }

    // Send result to backend using a POST request
    fetch("/save_vision_result", {
        method: "POST",
        headers: {
            "Content-Type": "application/json" // JSON data format
        },
        body: JSON.stringify({ result: message }) // send the message
    })
    .then(() => {
        // After saving, redirect user to results page
        window.location.href = "/vision_results";
    });

    // Optional: display message on the current page immediately
    document.getElementById("status").innerText = message;
}