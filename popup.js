document.addEventListener('DOMContentLoaded', () => {
	const feedQAToggle = document.getElementById("feed-qa-toggle-switch");
    const globalToggle = document.getElementById("global-toggle-switch");
	const hoverToggle = document.getElementById("hover-toggle-switch");
	const profileToggle = document.getElementById("profile-toggle-switch");
	const redTateToggle = document.getElementById("red-tate-toggle-switch");

	const toggles = [
		"feedQAToggle",
		"globalToggle",
		"hoverToggle",
		"profileToggle",
		"redTateToggle"
	]

	const defaultSettings = {
		"feedQAToggle": true,
		"globalToggle": true,
		"hoverToggle": false,
		"profileToggle": false,
		"redTateToggle": false
	}

	chrome.storage.sync.get(toggles, (r) => {
		if (typeof r.globalToggle === "undefined") {
			chrome.storage.sync.set(defaultSettings);
			feedQAToggle.checked = defaultSettings.feedQAToggle;
			globalToggle.checked = defaultSettings.globalToggle;
			hoverToggle.checked = defaultSettings.hoverToggle;
			profileToggle.checked = defaultSettings.profileToggle;
			redTateToggle.checked = defaultSettings.redTateToggle;
		}
        else {
			feedQAToggle.checked = r.feedQAToggle;
			globalToggle.checked = r.globalToggle;
        	hoverToggle.checked = r.hoverToggle;
        	profileToggle.checked = r.profileToggle;
			redTateToggle.checked = r.redTateToggle;
		}
		updateToggles();
    });

	feedQAToggle.addEventListener("change", () => {
		chrome.storage.sync.set({ feedQAToggle: feedQAToggle.checked });
	});
	globalToggle.addEventListener("change", () => {
		chrome.storage.sync.set({ globalToggle: globalToggle.checked });
	});
	hoverToggle.addEventListener("change", () => {
		chrome.storage.sync.set({ hoverToggle: hoverToggle.checked });
	});
	profileToggle.addEventListener("change", () => {
		chrome.storage.sync.set({ profileToggle: profileToggle.checked });
	});
	redTateToggle.addEventListener("change", () => {
		chrome.storage.sync.set({ redTateToggle: redTateToggle.checked });
	})

	function updateToggles() {
        const isEnabled = globalToggle.checked;
        hoverToggle.disabled = !isEnabled;
        profileToggle.disabled = !isEnabled;
    }

    globalToggle.addEventListener("change", updateToggles);
});