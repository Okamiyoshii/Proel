document.addEventListener("DOMContentLoaded", () => {
    const mapElement = document.getElementById("leaflet-map");
    
    if (mapElement && typeof L !== "undefined") {
        const map = L.map("leaflet-map").setView([34.0522, -118.2437], 13);

      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
    maxZoom: 19,
    subdomains: 'abcd',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
}).addTo(map);

        const foodTrucks = [
            {
                id: "smash-grab",
                name: "Smash & Grab Burgers",
                desc: "Night Market DTLA • Open Now",
                lat: 34.0430,
                lng: -118.2673
            },
            {
                id: "fuego-tacos",
                name: "Street Tacos Express",
                desc: "Echo Park Lake • Open Now",
                lat: 34.0782,
                lng: -118.2606
            },
            {
                id: "sweet-spot",
                name: "The Sweet Spot Desserts",
                desc: "Grand Ave • Opening 5 PM",
                lat: 34.0537,
                lng: -118.2427
            }
        ];

        const markers = {};

        foodTrucks.forEach(truck => {
            const marker = L.marker([truck.lat, truck.lng]).addTo(map);
            marker.bindPopup(`<strong>${truck.name}</strong><br>${truck.desc}`);
            markers[truck.id] = marker;
        });

        const truckItems = document.querySelectorAll(".truck-item[data-truck-id]");
        
        truckItems.forEach(item => {
            const selectTruck = () => {
                const truckId = item.getAttribute("data-truck-id");
                const lat = parseFloat(item.getAttribute("data-lat"));
                const lng = parseFloat(item.getAttribute("data-lng"));

                truckItems.forEach(i => i.classList.remove("active-truck"));
                item.classList.add("active-truck");

                map.flyTo([lat, lng], 15, {
                    animate: true,
                    duration: 1.2
                });

                if (markers[truckId]) {
                    setTimeout(() => {
                        markers[truckId].openPopup();
                    }, 600);
                }
            };

            item.addEventListener("click", selectTruck);
            item.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    selectTruck();
                }
            });
        });
    }

    let soundEnabled = localStorage.getItem("sfxEnabled") !== "false";
    const soundToggleBtn = document.getElementById("sound-toggle");
    let audioCtx = null;

    function initAudioContext() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    function updateSoundButton() {
        if (soundToggleBtn) {
            soundToggleBtn.textContent = soundEnabled ? "🔊 SFX On" : "🔇 SFX Off";
            soundToggleBtn.setAttribute("aria-pressed", soundEnabled);
        }
    }

    function playSound(type = "click") {
        if (!soundEnabled) return;
        initAudioContext();
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        if (type === "modal") {
            osc.type = "triangle";
            osc.frequency.setValueAtTime(440, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.12);
            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
        } else {
            osc.type = "sine";
            osc.frequency.setValueAtTime(580, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(220, audioCtx.currentTime + 0.08);
            gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
        }

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + (type === "modal" ? 0.12 : 0.08));
    }

    updateSoundButton();

    if (soundToggleBtn) {
        soundToggleBtn.addEventListener("click", () => {
            soundEnabled = !soundEnabled;
            localStorage.setItem("sfxEnabled", soundEnabled);
            updateSoundButton();
            if (soundEnabled) playSound("click");
        });
    }

    document.querySelectorAll(".sfx-trigger, .btn, .nav-links a").forEach(element => {
        element.addEventListener("click", () => {
            playSound("click");
        });
    });

    const menuToggle = document.getElementById("menu-toggle");
    const navLinksContainer = document.getElementById("nav-links");

    if (menuToggle && navLinksContainer) {
        menuToggle.addEventListener("click", () => {
            const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
            menuToggle.setAttribute("aria-expanded", !isExpanded);
            navLinksContainer.classList.toggle("active");
        });
    }

    const modal = document.getElementById("menu-modal");
    const modalTitle = document.getElementById("modal-title");
    const modalItems = document.getElementById("modal-items");
    const modalClose = document.getElementById("modal-close");

    document.querySelectorAll(".modal-trigger").forEach(button => {
        button.addEventListener("click", (e) => {
            e.preventDefault();
            const vendorName = button.getAttribute("data-vendor");
            const rawItems = button.getAttribute("data-items");

            if (modal && vendorName && rawItems) {
                modalTitle.textContent = `${vendorName} - Menu`;
                modalItems.innerHTML = "";
                
                rawItems.split(",").forEach(itemStr => {
                    const li = document.createElement("li");
                    li.textContent = itemStr.trim();
                    modalItems.appendChild(li);
                });

                modal.removeAttribute("hidden");
                playSound("modal");
            }
        });
    });

    if (modalClose) {
        modalClose.addEventListener("click", () => {
            if (modal) modal.setAttribute("hidden", "true");
        });
    }

    if (modal) {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                modal.setAttribute("hidden", "true");
            }
        });
    }

    const fadeObserverOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -40px 0px"
    };

    const fadeObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    }, fadeObserverOptions);

    document.querySelectorAll(".fade-in-section").forEach(section => {
        fadeObserver.observe(section);
    });

    document.querySelectorAll('a[href$=".html"]').forEach(anchor => {
        anchor.addEventListener("click", function(e) {
            const targetUrl = this.getAttribute("href");
            if (targetUrl && !targetUrl.startsWith("#")) {
                e.preventDefault();
                document.body.style.opacity = "0";
                document.body.style.transition = "opacity 0.25s ease";
                setTimeout(() => {
                    window.location.href = targetUrl;
                }, 250);
            }
        });
    });
});
