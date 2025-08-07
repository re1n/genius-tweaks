function findExactLinearGradients() {
    const stylesheets = document.styleSheets;
    const gradientData = [];

    for (let sheet of stylesheets) {
        try {
            const cssRules = sheet.cssRules || sheet.rules;
            for (let rule of cssRules) {
                if (rule.style && rule.style.backgroundImage) {
                    const backgroundImage = rule.style.backgroundImage;
                    
                    if (/^linear-gradient\(/.test(backgroundImage) && !/^repeating-linear-gradient\(/.test(backgroundImage)) {
                        gradientData.push({
                            className: rule.selectorText,
                            gradientValue: backgroundImage
                        });
                    }
                }
            }
        } catch (e) {
            console.warn("Cannot access stylesheet:", sheet.href);
        }
    }
	return gradientData[0].className.substring(1);
}

function updateCSSRule(selector, rule, newValue) {
    const stylesheets = document.styleSheets;
    let ruleExists = false;

    for (let sheet of stylesheets) {
        try {
            const cssRules = sheet.cssRules || sheet.rules;
            for (let i = 0; i < cssRules.length; i++) {
                if (cssRules[i].selectorText === selector) {
                    cssRules[i].style[rule] = newValue;
                    ruleExists = true;
                    break;
                }
            }
        } catch (e) {
            console.warn("Cannot access stylesheet:", sheet.href);
        }
    }

    if (!ruleExists) {
        const styleElement = document.createElement("style");
        styleElement.textContent = `
            ${selector} {
                ${rule}: ${newValue} !important;
            }
        `;
        document.head.appendChild(styleElement);
    }
}

function getFirstGradientRGB(className) {
    const stylesheets = document.styleSheets;

    for (let sheet of stylesheets) {
        try {
            const cssRules = sheet.cssRules || sheet.rules;
            for (let rule of cssRules) {
                if (rule.selectorText && rule.selectorText.includes(`.${className}`)) {
                    const style = rule.style;
                    if (style && style.backgroundImage.includes("linear-gradient")) {
                        const gradient = style.backgroundImage;
                        const match = gradient.match(/rgb\(\d{1,3},\s*\d{1,3},\s*\d{1,3}\)/);
                        if (match) {
                            return match[0];
                        }
                    }
                }
            }
        } catch (e) {
            console.warn("Cannot access stylesheet:", sheet.href);
        }
    }

    return null;
}

(async () => {
	await chrome.storage.sync.get("redTateToggle", (r) => {
		if (r.redTateToggle === true) {
			redTatesGrey();
		}
    });
})();

function redTatesGrey() {
	const firstGradient = getFirstGradientRGB(findExactLinearGradients());
	updateCSSRule(".daUKgp", "background-color", "rgb(233, 233, 233)");
	updateCSSRule(".izNXTm", "background-color", firstGradient);
	updateCSSRule(".izNXTm", "color", "#fff");
};

const elements = [
    '.leaderboard-user .user_badge-iq', // IQ values for verified artists in profile LB
    '.user_badge-iq.user_badge-iq--one_line', // IQ values in lists of Bagon elements
    '.hSEdAI', // IQ values on Top Scholars today list
    '.iq_value', // IQ values in forums
    '.hhZQfn', // IQ values in lists of React elements
	'.inbox_line_item_detail_forum_post-body_container .user_badge-iq',
];

function replaceValues(globalToggle, hoverToggle, profileToggle, feedQAToggle, doc = document) {

	if (feedQAToggle === true) {
		const qa = Array.from(doc.querySelectorAll("inbox[inbox-name='newsfeed_inbox'] .feed_dropdown-item"))
		.filter(el => el.textContent.includes("a question on"));
		qa.forEach((element) => {
			element.style.display = "none";
		})
	}
	if (globalToggle === true) {
		let els = elements.join(", ");
		if (hoverToggle === false) {
			els += ", .user_info_with_actions .user_badge-iq, .iqs, .dvgEip";
		}
		if (profileToggle === false) {
			els += ", .profile_identity-iq";
		}

		const iqElements = doc.querySelectorAll(els);
		iqElements.forEach((element) => {
			element.style.display = "none";
		});

		const leaderboardIQ = doc.querySelectorAll(".white_container .leaderboard-sort_value");
		leaderboardIQ.forEach((element) => {
			element.style.visibility = "hidden";
		});

		const navbarIQ = doc.querySelectorAll('[class*="TextLabel-sc"]');
		navbarIQ.forEach((element) => {
			if (element.textContent.includes("Earn")) {
				element.parentNode.parentNode.parentNode.parentNode.style.display = "none";
			} else if (element.textContent.includes("IQ")) {
				element.parentNode.style.display = "none";
			}
		});

		const bagonNavbarIQ = doc.querySelectorAll('[class*="header-action-label"]');
		bagonNavbarIQ.forEach((element) => {
			if (element.textContent.includes("Earn")) {
				element.parentNode.style.display = "none";
			} else if (element.textContent.includes("IQ")) {
				element.style.display = "none";
			}
		});
	}
}

function handleNavigation() {
    const currentUrl = location.href;
    let lastUrl = currentUrl;
    const urlObserver = new MutationObserver(() => {
        const newUrl = location.href;
        if (newUrl !== lastUrl) {
            lastUrl = newUrl;
            replaceValues(globalToggle, hoverToggle, profileToggle, feedQAToggle);
        }
    });
    urlObserver.observe(document.body, { childList: true, subtree: true });
}

function debounce(func, wait) {
    let timeout;
    return function () {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, arguments), wait);
    };
}

let globalToggle, hoverToggle, profileToggle, feedQAToggle;

const targetNode = document.body;
const config = { childList: true, subtree: true };
const observer = new MutationObserver(
    debounce(() => {
        replaceValues(globalToggle, hoverToggle, profileToggle, feedQAToggle);
        checkAndAttachIframeObservers();
    }, 300)
);

function checkAndAttachIframeObservers() {
    document.querySelectorAll("iframe").forEach((iframe) => {
        if (!iframe.dataset.observed) {
            attachObserverToIframe(iframe);
            iframe.dataset.observed = "true"; // Prevent duplicate observers
        }
    });
}

function attachObserverToIframe(iframe) {
    iframe.addEventListener("load", () => {
        try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            if (!iframeDoc) return;

            replaceValues(globalToggle, hoverToggle, profileToggle, feedQAToggle, iframeDoc); // Run once on load

            const iframeObserver = new MutationObserver(
                debounce(() => replaceValues(globalToggle, hoverToggle, profileToggle, feedQAToggle, iframeDoc), 300)
            );

            iframeObserver.observe(iframeDoc.body, { childList: true, subtree: true });
        } catch (e) {
            console.warn("Cannot access iframe content due to cross-origin restrictions", e);
        }
    });
}

(async () => {
	await chrome.storage.sync.get("feedQAToggle", (r) => {
		feedQAToggle = r.feedQAToggle;
	});
    await chrome.storage.sync.get("hoverToggle", (r) => {
        hoverToggle = r.hoverToggle;
    });
    await chrome.storage.sync.get("profileToggle", (r) => {
        profileToggle = r.profileToggle;
    });
    await chrome.storage.sync.get("globalToggle", (r) => {
        globalToggle = r.globalToggle;
    });
	handleNavigation();
	replaceValues(globalToggle, hoverToggle, profileToggle, feedQAToggle);
	observer.observe(targetNode, config);
})();
