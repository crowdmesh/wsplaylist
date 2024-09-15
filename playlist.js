// Update both play/pause buttons globally
function updateIcons(isPlaying, track) {
    // Main player control icons
    const playIcon = document.getElementById("play-icon");
    const pauseIcon = document.getElementById("pause-icon");

    if (isPlaying) {
        playIcon.style.display = "none";
        pauseIcon.style.display = "block";
    } else {
        playIcon.style.display = "block";
        pauseIcon.style.display = "none";
    }

    // Individual track icons
    if (track) {
        const trackPlayIcon = track.querySelector(".track-play-icon");
        const trackPauseIcon = track.querySelector(".track-pause-icon");
        const trackNumberText = track.querySelector(".track-number-text");

        if (isPlaying) {
            trackNumberText.style.display = "none";
            trackPlayIcon.style.display = "none";
            trackPauseIcon.style.display = "inline-block";
        } else {
            trackNumberText.style.display = "none";
            trackPlayIcon.style.display = "inline-block";
            trackPauseIcon.style.display = "none";
        }
    }
}

// Function to reset icons for all tracks
function resetAllTrackIcons(trackItems) {
    trackItems.forEach(function (track) {
        const playIcon = track.querySelector(".track-play-icon");
        const pauseIcon = track.querySelector(".track-pause-icon");
        const trackNumberText = track.querySelector(".track-number-text");

        trackNumberText.style.display = "block";
        playIcon.style.display = "none";
        pauseIcon.style.display = "none";
        track.classList.remove("playing");
    });
}

// Get the buttons outside of initializeAudioPlayer
const playPauseButton = document.getElementById("play-pause-btn");
const prevButton = document.getElementById("prev-btn");
const nextButton = document.getElementById("next-btn");
let trackItems = []; // Declare trackItems globally to be used throughout

// Set up the event listeners once
let listenersSetUp = false; // Flag to check if listeners are already set up

function setupEventListeners() {
    if (listenersSetUp) return; // If listeners are already set up, skip setting them up again

    playPauseButton.addEventListener("click", function () {
        if (currentPlayingWaveSurfer) {
            if (currentPlayingWaveSurfer.isPlaying()) {
                currentPlayingWaveSurfer.pause();
                updateIcons(false, currentPlayingTrack); // Update both main and track icons
            } else {
                currentPlayingWaveSurfer.play();
                updateIcons(true, currentPlayingTrack); // Update both main and track icons
            }
        } else {
            // If no track is currently loaded, load and play the first one
            const firstTrack = trackItems[currentTrackIndex];
            stopAndLoadTrack(currentTrackIndex);
            updateIcons(true, firstTrack);
        }
    });

    nextButton.addEventListener("click", function () {
        console.log("Before Next Click: currentTrackIndex = ", currentTrackIndex);
        currentTrackIndex = (currentTrackIndex + 1) % trackItems.length;
        console.log("After Next Click: currentTrackIndex = ", currentTrackIndex);
        stopAndLoadTrack(currentTrackIndex); // Load the next track
    });

    prevButton.addEventListener("click", function () {
        console.log("Before Prev Click: currentTrackIndex = ", currentTrackIndex);
        currentTrackIndex = (currentTrackIndex - 1 + trackItems.length) % trackItems.length;
        console.log("After Prev Click: currentTrackIndex = ", currentTrackIndex);
        stopAndLoadTrack(currentTrackIndex); // Load the previous track
    });

    listenersSetUp = true; // Set the flag to true after setting up listeners
}


// Stop the current track and load a new one
function stopAndLoadTrack(index) {
    let selectedTrack = trackItems[index]; // Get the selected track based on index
    let trackUrl = selectedTrack.getAttribute("data-url"); // Fetch the track URL

    // Update the preview section with the current track's title and artist name
            const trackTitle = selectedTrack.querySelector('.track-title').textContent;
            const trackArtist = selectedTrack.querySelector('.track-artist').textContent;
            document.getElementById('preview-track-title').textContent = trackTitle;
            document.getElementById('preview-artist-name').textContent = trackArtist

    // Get the single waveform container
    let container = document.querySelector(".waveform-container");

    // Ensure the container is available before creating WaveSurfer
    if (!container) {
        console.error("Waveform container not found.");
        return; // Stop further execution if the container is not found
    }

    // Check if the current instance is playing or processing
    if (currentPlayingWaveSurfer && currentPlayingWaveSurfer.isReady) {
        currentPlayingWaveSurfer.destroy();
        currentPlayingWaveSurfer = null;
    }

    // Clear the existing waveform content
    container.innerHTML = "";

    // Destroy the previous WaveSurfer instance directly from the container
    if (container.wavesurfer) {
        container.wavesurfer.destroy(); // Destroy the existing instance
        container.wavesurfer = null; // Clear the reference
    }

    // Create a new WaveSurfer instance for the new track using the single container
    let wavesurfer = WaveSurfer.create({
        container: container, // Use the single container
        waveColor: "#575757",
        progressColor: "#a9a9a9",
        cursorColor: "#FFFFFF",
        barWidth: 1,
        height: 64,
        minPxPerSec: 10,
        responsive: 100,
        hideScrollbar: true
    });

    // Assign the new WaveSurfer instance to the container
    container.wavesurfer = wavesurfer;

    // Load the new track into the newly created WaveSurfer instance
    wavesurfer.load(trackUrl);

    // Play the track when it's ready
    wavesurfer.on("ready", function () {
        wavesurfer.play(); // Start playing the track immediately when it's ready
        updateIcons(true, selectedTrack); // Update the UI to reflect the playing state
    });

    // Automatically play the next track when this one finishes
wavesurfer.on('finish', function() {
console.log("Track finished: Auto-playing next track");
currentTrackIndex = (currentTrackIndex + 1) % trackItems.length;
stopAndLoadTrack(currentTrackIndex); // Load the next track
});

    // Reset the UI for all tracks and update the current track's UI
    resetAllTrackIcons(trackItems);
    selectedTrack.classList.add("playing"); // Mark the new track as playing
    currentPlayingTrack = selectedTrack; // Set the new track as the current playing track
    currentPlayingWaveSurfer = wavesurfer; // Update the global reference to the new instance
}

//WaveSurfer Logic
let currentTrackIndex = 0; // Track the currently playing track index
var currentPlayingWaveSurfer = null; // To keep track of the currently playing WaveSurfer instance
var currentPlayingTrack = null; // To keep track of the currently playing track

function initializeAudioPlayer() {
    var waveformContainers = document.querySelectorAll(".waveform-container");
    trackItems = document.querySelectorAll("#tracklist li");
    waveformContainers.forEach(function (container) {
        // If there's an existing WaveSurfer instance in the container, destroy it
        if (container.wavesurfer) {
            container.wavesurfer.destroy();  // Destroy the existing instance
            container.innerHTML = "";  // Clear the container element's content (the waveform)
        }

        var wavesurfer = WaveSurfer.create({
            container: container,
            waveColor: "#575757",
            progressColor: "#a9a9a9",
            cursorColor: "#FFFFFF",
            barWidth: 1,
            height: 64,
            minPxPerSec: 10,
            responsive: 100,
            hideScrollbar: true
        });

        // Attach the new WaveSurfer instance to the container so it can be accessed later
        container.wavesurfer = wavesurfer;

        // Load the first track waveform but don't autoplay
        let audioSrc = trackItems[currentTrackIndex].getAttribute("data-url");
        console.log("Loading first track:", audioSrc);
        wavesurfer.load(audioSrc);
        currentPlayingTrack = trackItems[currentTrackIndex];
        currentPlayingWaveSurfer = wavesurfer;

        // ** Update the preview elements with the first track's info **
        const trackTitle = currentPlayingTrack.querySelector('.track-title').textContent;
        const trackArtist = currentPlayingTrack.querySelector('.track-artist').textContent;
                console.log("Initial track title:", trackTitle);
        console.log("Initial track artist:", trackArtist); // Log the artist name
                document.getElementById('preview-track-title').textContent = trackTitle;
                document.getElementById('preview-artist-name').textContent = trackArtist;

        // Ensure the UI shows the play state correctly after initialization
        updateIcons(false, currentPlayingTrack);

        // Tracklist interaction
        trackItems.forEach(function (track, index) {
            track.addEventListener("mouseenter", function () {
                if (!track.classList.contains("playing")) {
                    var playIcon = track.querySelector(".track-play-icon");
                    var trackNumberText = track.querySelector(".track-number-text");
                    var pauseIcon = track.querySelector(".track-pause-icon");
                    trackNumberText.style.display = "none";
                    playIcon.style.display = "inline-block";
                    pauseIcon.style.display = "none";
                }
            });

            track.addEventListener("mouseleave", function () {
                if (!track.classList.contains("playing")) {
                    var playIcon = track.querySelector(".track-play-icon");
                    var trackNumberText = track.querySelector(".track-number-text");
                    var pauseIcon = track.querySelector(".track-pause-icon");
                    trackNumberText.style.display = "block";
                    playIcon.style.display = "none";
                    pauseIcon.style.display = "none";
                }
            });

            track.addEventListener("click", function () {
                console.log("Track clicked: Index = ", index, "URL = ", track.getAttribute("data-url"));
                if (currentPlayingTrack !== track) {
                    // Use stopAndLoadTrack to handle loading and playing the selected track
                    stopAndLoadTrack(index);
                } else {
                    // Toggle play/pause for the currently playing track
                    if (currentPlayingWaveSurfer.isPlaying()) {
                        currentPlayingWaveSurfer.pause();
                        updateIcons(false, track); // Update both main and track icons
                    } else {
                        currentPlayingWaveSurfer.play();
                        updateIcons(true, track); // Update both main and track icons
                    }
                }
            });
        });

        // Error handling in case of loading errors
        wavesurfer.on("error", function (e) {
            console.error("WaveSurfer Error:", e);
        });
    });
}
