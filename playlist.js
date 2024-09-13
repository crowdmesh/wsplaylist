// Function to toggle between dark and light theme
        function toggleTheme() {
            const body = document.body;
            const themeToggleBtn = document.getElementById('theme-toggle');

            body.classList.toggle('light-theme');

            if (body.classList.contains('light-theme')) {
                themeToggleBtn.textContent = 'Switch to Dark Theme';
            } else {
                themeToggleBtn.textContent = 'Switch to Light Theme';
            }
        }

        // Update album and artist name preview
        function updatePreview() {
            const albumName = document.getElementById('album-name').value || "Album Name";
            document.getElementById('preview-album-name').textContent = albumName;
        }

        // Update album art preview
        function updateAlbumArtPreview() {
            const albumArtInput = document.getElementById('album-art');
            const albumArtPreview = document.getElementById('album-art-preview');

            const albumArtUrl = albumArtInput.value.trim(); // Get the entered URL
            if (albumArtUrl) {
                albumArtPreview.src = albumArtUrl; // Set the image source to the entered URL
            } else {
                albumArtPreview.src = "https://via.placeholder.com/100"; // Fallback to a placeholder if the field is empty
            }
        }


        let trackCounter = 0;
        let tracksData = []; // Global array to store track data
        const trackListContainer = document.getElementById('track-list');  // Setup section track list
        const previewTrackList = document.getElementById('tracklist');  // Preview section track list

        // Initialize the default tracks in both the setup and preview sections
        function initializeDefaultTracks() {
            // Prepopulate the track list with default Track 1 and Track 2
            addTrackToList('Track 1', 'Artist Name', 'https://storage.googleapis.com/msgsndr/L5RJ1dq0vnvdiWPELZDP/media/66da435f7b3dde51865baf98.mpeg', false);
            addTrackToList('Track 2', 'Artist Name', 'https://storage.googleapis.com/msgsndr/Vrsq8TV0vEWl8Ll6brka/media/666718517ff79c6fc319073b.mpeg', false);
            

        }


        // Add track to both the setup and preview sections
        function addTrackToList(trackName, artistName, trackUrl) {
            trackCounter++;
            const trackId = `track-${trackCounter}`;

            // Store track data in the array
            tracksData.push({
                trackId,
                trackName,
                artistName,
                trackUrl,
                trackTime: "Loading..." // Track time will be updated later
            });

            // Rebuild the setup and preview sections
            rebuildSetupSection();
            rebuildPreviewSection();

            // After rebuilding, re-initialize audio player to bind the events to the new track
            initializeAudioPlayer();
            
        }

        // Fetch the track duration using an audio element
        function fetchTrackDuration(trackUrl, trackCounter) {
            const audio = new Audio(trackUrl);

            // Error handling for failed loading
            audio.addEventListener('error', function() {
                const timeElement = document.getElementById(`track-time-${trackCounter}`);
                timeElement.textContent = "Error loading time";
            });

            // Fetch the duration once the metadata is loaded
            audio.addEventListener('loadedmetadata', function() {
                const trackTime = formatTime(audio.duration);
                const timeElement = document.getElementById(`track-time-${trackCounter}`);
                timeElement.textContent = trackTime;

                // Update track time in global tracksData array
                tracksData[trackCounter - 1].trackTime = trackTime; // Update time in the correct index

            });
        }


        // Format time in MM:SS format
        function formatTime(timeInSeconds) {
            const minutes = Math.floor(timeInSeconds / 60);
            const seconds = Math.floor(timeInSeconds % 60).toString().padStart(2, '0');
            return `${minutes}:${seconds}`;
        }

        // Rebuild the setup section using tracksData
        function rebuildSetupSection() {
            trackListContainer.innerHTML = ''; // Clear current setup section
            tracksData.forEach((track, index) => {
                const trackItem = document.createElement('div');
                trackItem.classList.add('track-item');
                trackItem.id = track.trackId;
                trackItem.innerHTML = `
                    <span><strong>${track.trackName}</strong></span>
                    <button type="button" class="delete-btn" onclick="deleteTrack('${track.trackId}')"><i class="fa-solid fa-xmark"></i></button>
                `;
                trackListContainer.appendChild(trackItem);
            });
        }

        // Rebuild the preview section using tracksData
        function rebuildPreviewSection() {
            previewTrackList.innerHTML = ''; // Clear current preview section
            tracksData.forEach((track, index) => {
                const trackPreviewItem = document.createElement('li');
                trackPreviewItem.setAttribute('data-url', track.trackUrl);
                trackPreviewItem.id = `track-preview-${index + 1}`;
                trackPreviewItem.innerHTML = `
                    <div class="track-number">
                        <img id="track-play-icon-${index + 1}" class="track-play-icon" src="https://storage.googleapis.com/msgsndr/5KgPcYXxhFJNe6A0vTLj/media/66e094e7ea125b3b69e4aa59.svg" alt="Play" style="display: none;">
                        <img id="track-pause-icon-${index + 1}" class="track-pause-icon" src="https://storage.googleapis.com/msgsndr/5KgPcYXxhFJNe6A0vTLj/media/66e094e730211d65ad550edf.svg" alt="Pause" style="display: none;">
                        <span class="track-number-text">${index + 1}</span>
                    </div>
                    <div class="track-details">
                        <span class="track-title">${track.trackName}</span>
                        <span class="track-artist">${track.artistName}</span>
                    </div>
                    <span id="track-time-${index + 1}" class="track-time">${track.trackTime}</span>
                `;
                previewTrackList.appendChild(trackPreviewItem);

                // Fetch the audio duration and update the preview with the correct time
                fetchTrackDuration(track.trackUrl, index + 1);
            });
            
        }

        // Update tracksData order based on the new visual order
        function updateTrackDataOrder() {
            const trackItems = document.querySelectorAll('.track-item'); // In the setup section
            tracksData = Array.from(trackItems).map((item, index) => {
                const trackId = item.id;
                const track = tracksData.find(track => track.trackId === trackId);
                return {
                    trackId: track.trackId,
                    trackName: track.trackName,
                    artistName: track.artistName,
                    trackUrl: track.trackUrl,
                    trackTime: track.trackTime
                };
            });
        }

        function addTrack() {
            const trackName = document.getElementById('track-name').value;
            const artistName = document.getElementById('artist-name').value;
            const trackUrl = document.getElementById('track-url').value;

            if (!trackName || !artistName || !trackUrl) {
                alert('Please fill in all track details.');
                return;
            }

            // Add track to both the setup and preview sections
            addTrackToList(trackName, artistName, trackUrl, false);

            // Reset the form fields after adding the track
            document.getElementById('track-name').value = '';
            document.getElementById('artist-name').value = '';
            document.getElementById('track-url').value = '';
        }



        // Delete a track from both sections
        function deleteTrack(trackId) {
            tracksData = tracksData.filter(track => track.trackId !== trackId);
            rebuildSetupSection();
            rebuildPreviewSection();
        }

        // Renumber tracks after reordering
        function renumberTracks() {
            const trackItems = document.querySelectorAll('.track-item'); // In the setup section

            // Update `tracksData` to reflect the new visual order
            tracksData = Array.from(trackItems).map((item, index) => {
                const trackId = item.id;  // Get the trackId from the HTML element
                const track = tracksData.find(track => track.trackId === trackId); // Find the track in the original data
                return { 
                    ...track,  // Preserve all the existing track data
                    trackId: `track-${index + 1}`  // Update the trackId to reflect the new order
                };
            });

            // Rebuild the preview section to reflect the new order
            rebuildPreviewSection(); // Ensure the preview section is updated after renumbering
            updatePreviewOrder();

            // Re-initialize the audio player after reordering
            initializeAudioPlayer(); // Make sure to call this so the player works with the new order
        }


        // Function to update preview order based on global track data
        function updatePreviewOrder() {
            const previewTrackList = document.getElementById('tracklist'); // Preview section list

            // Clear the preview list
            previewTrackList.innerHTML = '';

            // Loop through the updated track data and rebuild the preview section
            tracksData.forEach((track, index) => {
                const trackNumber = index + 1;

                // Create the preview item dynamically
                const newPreviewItem = document.createElement('li');
                newPreviewItem.setAttribute('data-url', track.trackUrl); // Re-assign the data-url attribute here
                newPreviewItem.id = `track-preview-${trackNumber}`;

                newPreviewItem.innerHTML = `
                    <div class="track-number">
                        <img id="track-play-icon-${index + 1}" class="track-play-icon" src="https://storage.googleapis.com/msgsndr/5KgPcYXxhFJNe6A0vTLj/media/66e094e7ea125b3b69e4aa59.svg" alt="Play" style="display: none;">
                        <img id="track-pause-icon-${index + 1}" class="track-pause-icon" src="https://storage.googleapis.com/msgsndr/5KgPcYXxhFJNe6A0vTLj/media/66e094e730211d65ad550edf.svg" alt="Pause" style="display: none;">
                        <span class="track-number-text">${trackNumber}</span>
                    </div>
                    <div class="track-details">
                        <span class="track-title">${track.trackName}</span>
                        <span class="track-artist">${track.artistName}</span>
                    </div>
                    <span id="track-time-${trackNumber}" class="track-time">${track.trackTime}</span>
                `;

                // Append the newly created item to the preview list
                previewTrackList.appendChild(newPreviewItem);

                // Fetch the audio duration and reload the track in case of reordering
                fetchTrackDuration(track.trackUrl, trackNumber);
            });
        }


        // Update the preview section based on the track list
        function updatePreviewSection() {
            const albumName = document.getElementById('album-name').value || "Album Name";
            const artistName = document.getElementById('artist-name').value || "Artist Name";
            
            document.getElementById('preview-album-name').textContent = albumName;
            document.getElementById('preview-artist-name').textContent = artistName;

            // Additional logic can be added here to load the tracks into the preview player.
        }

        //WaveSurfer Logic
        var currentPlayingWaveSurfer = null; // To keep track of the currently playing WaveSurfer instance
        var currentPlayingTrack = null; // To keep track of the currently playing track

        function initializeAudioPlayer() {
            var waveformContainers = document.querySelectorAll(".waveform-container");
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

                var trackItems = document.querySelectorAll("#tracklist li");
                var firstTrack = trackItems[0]; // Load the first track initially

                // Load the first track waveform but don't autoplay
                var audioSrc = firstTrack.getAttribute("data-url");
                console.log("Loading first track:", audioSrc);
                wavesurfer.load(audioSrc);
                currentPlayingTrack = firstTrack;

                var playPauseButton = document.getElementById("play-pause-btn");

                // Handle play/pause button click
                playPauseButton.addEventListener("click", function () {
                    if (wavesurfer.isPlaying()) {
                        console.log("Pausing track...");
                        wavesurfer.pause();
                        updatePlayPauseButton(false); // Update button to show play icon
                    } else {
                        if (currentPlayingWaveSurfer && currentPlayingWaveSurfer !== wavesurfer) {
                            console.log("Pausing other instance...");
                            currentPlayingWaveSurfer.pause(); // Pause the currently playing instance
                            updatePlayPauseButton(false); // Switch icons on the other player
                        }
                        console.log("Playing track...");
                        wavesurfer.play();
                        currentPlayingWaveSurfer = wavesurfer; // Update the currently playing instance
                        updatePlayPauseButton(true); // Update button to show pause icon
                    }
                });


                // Function to update the play/pause button based on the global playing state
                function updatePlayPauseButton(isPlaying) {
                    var playIcon = document.getElementById("play-icon");
                    var pauseIcon = document.getElementById("pause-icon");
                    if (isPlaying) {
                        playIcon.style.display = "none";
                        pauseIcon.style.display = "block";
                    } else {
                        playIcon.style.display = "block";
                        pauseIcon.style.display = "none";
                    }
                }


                // Toggle between play and pause icons
                function togglePlayPauseIcons(isPlaying) {
                    var playIcon = document.getElementById("play-icon");
                    var pauseIcon = document.getElementById("pause-icon");
                    if (isPlaying) {
                        playIcon.style.display = "none";
                        pauseIcon.style.display = "block";
                    } else {
                        playIcon.style.display = "block";
                        pauseIcon.style.display = "none";
                    }
                }

                // Tracklist interaction
                trackItems.forEach(function (track) {
                    track.addEventListener("mouseenter", function () {
                        console.log("Mouse entered track:", track);
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
                        console.log("Mouse left track:", track);
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
                        var trackUrl = track.getAttribute("data-url");
                        console.log("Clicked track:", trackUrl);

                        // If the same track is clicked and it's playing, pause it (without restarting)
                        if (currentPlayingTrack === track) {
                            if (wavesurfer.isPlaying()) {
                                wavesurfer.pause();
                                toggleTrackIcons(track, false); // Show play icon
                                updatePlayPauseButton(false); // Update button to show play icon
                            } else {
                                wavesurfer.play();
                                toggleTrackIcons(track, true); // Show pause icon
                                updatePlayPauseButton(true); // Update button to show pause icon
                            }
                            return; // Prevent further loading
                        }

                        // Reset UI for all tracks before starting a new one
                        trackItems.forEach(function (otherTrack) {
                            if (otherTrack !== track && otherTrack.classList.contains("playing")) {
                                console.log("Resetting UI for track:", otherTrack.getAttribute("data-url"));
                                resetTrackUI(otherTrack);  // Reset the UI for the previous track
                                otherTrack.classList.remove("playing");  // Remove 'playing' class from previous track
                            }
                        });

                        // Only load a new track if it's different from the currently playing one
                        if (currentPlayingTrack !== track) {
                            console.log("Loading and playing new track:", trackUrl);
                            wavesurfer.load(trackUrl);

                            // Automatically play the track after it's loaded
                            wavesurfer.on('ready', function () {
                                console.log("Track is ready to play:", trackUrl);
                                wavesurfer.play();
                                togglePlayPauseIcons(true); // Show pause icon when track plays
                                updateTrackUI(track); // Update UI to show that this track is playing
                                currentPlayingTrack = track; // Set this track as the currently playing one
                            });
                        }

                        // Update the current track
                        currentPlayingWaveSurfer = wavesurfer;
                    });
                });

                // Function to toggle play/pause icons for individual tracks
                function toggleTrackIcons(track, isPlaying) {
                    var playIcon = track.querySelector(".track-play-icon");
                    var pauseIcon = track.querySelector(".track-pause-icon");
                    if (isPlaying) {
                        playIcon.style.display = "none";
                        pauseIcon.style.display = "inline-block";
                        track.classList.add("playing");
                    } else {
                        playIcon.style.display = "inline-block";
                        pauseIcon.style.display = "none";
                        track.classList.remove("playing");
                    }
                }

                // Reset the UI for all tracks (hide play/pause icons, show track number)
                function resetTrackUI(track) {
                    var playIcon = track.querySelector(".track-play-icon");
                    var pauseIcon = track.querySelector(".track-pause-icon");
                    var trackNumberText = track.querySelector(".track-number-text");

                    console.log("Resetting UI for track:", track.getAttribute("data-url"));

                    trackNumberText.style.display = "block"; // Show track number
                    playIcon.style.display = "none"; // Hide play icon
                    pauseIcon.style.display = "none"; // Hide pause icon
                    track.classList.remove("playing"); // Remove the "playing" class
                }

                // Update the UI for the currently playing track (hide track number, show pause icon)
                function updateTrackUI(track) {
                    var playIcon = track.querySelector(".track-play-icon");
                    var pauseIcon = track.querySelector(".track-pause-icon");
                    var trackNumberText = track.querySelector(".track-number-text");

                    console.log("Updating UI for playing track:", track.getAttribute("data-url"));

                    // Ensure the UI reflects that only this track is playing
                    trackItems.forEach(function (otherTrack) {
                        if (otherTrack !== track) {
                            resetTrackUI(otherTrack);  // Reset others before updating the new one
                        }
                    });

                    trackNumberText.style.display = "none"; // Hide track number
                    playIcon.style.display = "none"; // Hide play icon
                    pauseIcon.style.display = "inline-block"; // Show pause icon
                    track.classList.add("playing"); // Add the "playing" class
                }

                // Reset icons when the audio finishes
                wavesurfer.on("finish", function () {
                    if (currentPlayingTrack) {
                        console.log("Track finished:", currentPlayingTrack.getAttribute("data-url"));
                        resetTrackUI(currentPlayingTrack); // Reset the current track's UI when finished
                    }
                    currentPlayingTrack = null; // Clear current playing track
                    updatePlayPauseButton(false); // Switch back to play icon when finished
                });

                // Error handling in case of loading errors
                wavesurfer.on("error", function (e) {
                    console.error("WaveSurfer Error:", e);
                });
            });
        }

        // Function to generate the embed code dynamically
        function generateEmbedCode() {
            // Assuming the playlist is part of the 'player-container' div
            const playerContainer = document.getElementById('player-container');

            // Check if player-container exists
            if (!playerContainer) {
                console.error("Player container not found!");
                return;
            }

            // Get the outer HTML of the player-container
            const playerHTML = playerContainer.outerHTML;
            console.log("Player HTML:", playerHTML);

            // Use a data URI to embed the player HTML within an iframe
            const embedUrl = `data:text/html;charset=utf-8,${encodeURIComponent(playerHTML)}`;
            console.log("Embed URL:", embedUrl);
            
            // Generate the iframe code
            const embedCode = `<iframe src="${embedUrl}" width="500" height="400" frameborder="0" allow="autoplay; encrypted-media"></iframe>`;

            // Place the embed code in the textarea
            document.getElementById('embed-code-textarea').value = embedCode;
        }

        // Function to copy the embed code to the clipboard
        function copyEmbedCode() {
            const embedTextarea = document.getElementById('embed-code-textarea');
            embedTextarea.select();
            document.execCommand('copy');
            alert('Embed code copied to clipboard!');
        }

        // Function to show the modal
        function showModal() {
            const modal = document.getElementById('embed-modal');
            modal.style.display = 'block';
            generateEmbedCode();  // Generate the embed code when the modal is shown
        }

        // Function to close the modal
        function closeModal() {
            const modal = document.getElementById('embed-modal');
            modal.style.display = 'none';
        }

        // Event listeners
        document.getElementById('embed-button').addEventListener('click', showModal);
        document.getElementById('copy-embed-code-btn').addEventListener('click', copyEmbedCode);
        document.querySelector('.close-modal').addEventListener('click', closeModal);

        // Close modal if clicked outside the modal content
        window.onclick = function(event) {
            const modal = document.getElementById('embed-modal');
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        };

        

        // Consolidated DOMContentLoaded listener
        document.addEventListener("DOMContentLoaded", function () {
            initializeDefaultTracks();
            updatePreviewSection();

            // Initialize Sortable for the setup section
            var setupList = document.getElementById('track-list');
            new Sortable(setupList, {
                animation: 150, // Animation speed
                onEnd: function () {
                    renumberTracks(); // Re-number the tracks after reordering
                }
            });

            
        });
