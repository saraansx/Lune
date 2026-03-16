function getRandomElement<T>(list: T[]): T {
    return list[Math.floor(Math.random() * list.length)] as T;
}

function generateRandomUserAgent(): string {
    const osList = [
        "Windows NT 10.0; Win64; x64",
        "Macintosh; Intel Mac OS X 10_15_7",
        "X11; Linux x86_64",
        "Linux; Android 14",
        "iPhone; CPU iPhone OS 18_7 like Mac OS X",
    ];

    const baseChromeVersion = 140;
    const chromeVersions: string[] = [];
    for (let i = 0; i < 5; i++) {
        chromeVersions.push(
            `${baseChromeVersion - i}.0.${Math.floor(Math.random() * 500)}.0`
        );
    }

    const webkit = "537.36";

    const selectedOs = getRandomElement(osList);
    const chromeVersion = getRandomElement(chromeVersions);

    const isMobile = selectedOs.includes("Android") || selectedOs.includes("iPhone");
    const mobileToken = isMobile ? " Mobile" : "";

    return `Mozilla/5.0 (${selectedOs}) AppleWebKit/${webkit} (KHTML, like Gecko) Chrome/${chromeVersion}${mobileToken} Safari/${webkit}`;
}

export { generateRandomUserAgent };
