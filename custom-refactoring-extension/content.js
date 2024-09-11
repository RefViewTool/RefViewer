let htmlelements = {};
let currentChangedElements = [];
let currentRefactoringIndex = 0;
let maxDistance;
let maxVisibleDistance = Number.MAX_VALUE;
let currentPathname = window.location.pathname;
let checkerInterval = null;
let onCommitPage = false;
let data = [];
let alreadyCheckingScroll = false;
let relation;

window.addEventListener('load', function () {
    currentPathname = window.location.pathname;
    const shouldStart = () => {
        if (isOnCommitPage()) {
            init();
        } else {
            clear();
        }
    }
    setInterval(() => {
        if (window.location.pathname !== currentPathname) {
            currentPathname = window.location.pathname;
            shouldStart();
        }

    }, 100);
    shouldStart();
});

async function init(loadedData) {
    clear();
    addLoadingBottomPainel();
    document.addEventListener('mouseover', function (event) {

        let foundClasse = "";
        for (let i = 0; i < event.target.classList.length; i++) {
            if (event.target.classList[i].startsWith('rcid_')) {
                foundClasse = event.target.classList[i]
            }
        }
        if (foundClasse) {
            document.querySelectorAll("." + foundClasse).forEach(el => el.classList.add('hovered'));
        }
    });

    document.addEventListener('mouseout', function (event) {
        let foundClasse = "";
        for (let i = 0; i < event.target.classList.length; i++) {
            if (event.target.classList[i].startsWith('rcid_')) {
                foundClasse = event.target.classList[i]
            }
        }
        if (foundClasse) {
            document.querySelectorAll("." + foundClasse).forEach(el => el.classList.remove('hovered'));
        }
    });
    try {
        if (!loadedData) {
            let experimentData = await loadExperimentData();

            if (experimentData) {
                const refData = experimentData.map(ref => `<strong>${ref.metadata.type}</strong>:<br><br><span id="ref-description">${ref.metadata.description}</span>`)
                const loadingText = document.getElementById("loading-text");
                loadingText.innerHTML = refData.join("<br>") + `<br><br>Hold the show button to reveal the relations  <button id="hold-button">show</button>`;
                loadingText.style.fontWeight = 400;
                loadingText.style.lineHeight = "14px";
                const holdButton = document.getElementById("hold-button");
                holdButton.style.maxWidth = '80px'
                holdButton.style.maxHeight = '25px'
                const refDescription = document.getElementById("ref-description");
                refDescription.style.color = "#3cffff";
                let holdTimeout;
                holdButton.addEventListener('mousedown', function () {
                    holdTimeout = setTimeout(() => {
                        init(experimentData)
                    }, 1000);
                });
                holdButton.addEventListener('mouseup', function () {
                    clearTimeout(holdTimeout);
                });

                return;
            }
        }
    } catch (e) {
        console.log(e);
    }
    try {
        if (!loadedData) {
            data = await findRefactorings();
        } else {
            data = loadedData;
        }

        addMarkers();
        mapElements();
        addBottomPainel();
        onCommitPage = true;
        let lastcount = 0;
        checkerInterval = setInterval(() => {
            if (!onCommitPage) {
                return;
            }
            const numberOfLines = document.getElementsByClassName("blob-num")?.length;
            if (lastcount == null) {
                lastcount = numberOfLines;
            }

            if (numberOfLines && lastcount != numberOfLines) {
                if (lastcount != 0) {
                    mapElements();
                }
                lastcount = numberOfLines;
            }
        }, 150);

    } catch (e) {
        console.log('Erro searching for refactoring', e);
        document.getElementById("loading-text").innerHTML = 'Error when loading refactoring data';
    }
}

function clear() {
    onCommitPage = false;
    if (checkerInterval) {
        clearInterval(checkerInterval);
        checkerInterval = null;
    }

    htmlelements = {};
    currentChangedElements = [];
    currentRefactoringIndex = 0;
    maxDistance = null;
    maxVisibleDistance = Number.MAX_VALUE;
    data = [];
    alreadyCheckingScroll = false;

    relation = {
        REFACTORING:
        {
            filter: 'refactoring-detail',
            highlightClass: 'highlight-refactoring',
            markerClass: 'ref-marker',
            visible: true,
            closestElementAbove: null,
            closestElementBelow: null,
        },
        NON_REFACTORING:
        {
            filter: 'nonref-detail',
            highlightClass: 'highlight-nonrefactoring',
            markerClass: 'nonref-marker',
            visible: true,
            closestElementAbove: null,
            closestElementBelow: null,
        },
        RELATED_REFACTORING:
        {
            filter: 'refactoring-related-detail',
            highlightClass: 'highlight-additional',
            markerClass: 'addref-marker',
            visible: true,
            closestElementAbove: null,
            closestElementBelow: null,
        }
    };

    document.getElementById("loading-panel")?.remove();
    document.getElementById("topMarker")?.remove();
    document.getElementById("bottomMarker")?.remove();
    document.getElementById("modification-summary")?.remove();
}

function isOnCommitPage() {
    const commitPattern = /^https:\/\/github\.com\/[^\/]+\/[^\/]+\/commit\/[a-f0-9]{40}$/;

    
    if (commitPattern.test(window.location.origin + window.location.pathname)) {
        return true;
    } else {
        return false;
    }
}

async function loadExperimentData() {
    let currentUrl = new URL(window.location.href);
    let regex = /https:\/\/github\.com\/[^\/]+\/([^\/]+)\/commit\/([a-f0-9]{40})/;
    let match = (currentUrl.origin + currentUrl.pathname).match(regex);

    if (match) {
        let projectName = match[1];
        let commitHash = match[2]
        const response = await fetch(chrome.runtime.getURL("data/" + projectName + "-" + commitHash + ".json"));
        return response.json();

    } else {
        throw new Error('URL inválida');
    }
}

function findRefactorings() {

    let currentUrl = new URL(window.location.href);

    let gitURL = currentUrl.origin + currentUrl.pathname.replace(/\/commit\/.*$/, '.git');
    let commitHash = currentUrl.pathname.split('/').pop();

    let localhostURL = `http://localhost:8080/fromCommit?gitURL=${encodeURIComponent(gitURL)}&commitHash=${commitHash}`;

    return fetch(localhostURL).then(response => {
        if (!response.ok) {
            throw new Error('Erro in the request to localhost');
        }
        return response.json();  
    });

}

function addMarkers() {
    const topMarker = document.createElement('div');
    topMarker.innerHTML = `
        <div id="topMarker" class="marker">
            <div id="ref-marker-top" class="ref-marker" title="Hidden refactoring modified lines above">  </div>            
            <div id="addref-marker-top" class="addref-marker" title="Hidden additional refactoring modified lines above">  </div>
            <div id="nonref-marker-top" class="nonref-marker" title="Hidden non-refactoring modified lines above">  </div>
        </div>
    `;
    const bottomMarker = document.createElement('div');
    bottomMarker.innerHTML = `
        <div id="bottomMarker" class="marker">
            <div id="ref-marker-bottom" class="ref-marker" title="Hidden refactoring modified lines below">  </div>            
            <div id="addref-marker-bottom" class="addref-marker" title="Hidden additional refactoring modified lines below">  </div>
            <div id="nonref-marker-bottom" class="nonref-marker" title="Hidden non-refactoring modified lines below">  </div>
        </div>
    `;
    document.body.appendChild(topMarker);
    document.body.appendChild(bottomMarker);

    document.getElementById("ref-marker-top").addEventListener('click', () => {
        relation.REFACTORING.closestElementAbove?.scrollIntoView();
    });
    document.getElementById("addref-marker-top").addEventListener('click', () => {
        relation.RELATED_REFACTORING.closestElementAbove?.scrollIntoView();
    });
    document.getElementById("nonref-marker-top").addEventListener('click', () => {
        relation.NON_REFACTORING.closestElementAbove?.scrollIntoView();
    });
    document.getElementById("ref-marker-bottom").addEventListener('click', () => {
        relation.REFACTORING.closestElementBelow?.scrollIntoView();
    });
    document.getElementById("addref-marker-bottom").addEventListener('click', () => {
        relation.RELATED_REFACTORING.closestElementBelow?.scrollIntoView();
    });
    document.getElementById("nonref-marker-bottom").addEventListener('click', () => {
        relation.NON_REFACTORING.closestElementBelow?.scrollIntoView();
    });
}

function addLoadingBottomPainel() {
    const summaryPanel = document.createElement('div');
    summaryPanel.id = 'loading-panel';
    summaryPanel.className = 'summary-panel';
    summaryPanel.innerHTML = `
        <div style="display: flex; margin-right: 8px">
            <h4 id="loading-text">Loading refactoring...</h4>
        </div>
    `;
    document.body.appendChild(summaryPanel);
}

function addBottomPainel() {
    document.getElementById('loading-panel')?.remove();
    const summaryPanel = document.createElement('div');
    summaryPanel.id = 'modification-summary';
    summaryPanel.className = 'summary-panel';
    summaryPanel.innerHTML = `
        <div>
            <h4>Refactorings:</h4>
            <select id="refactoring-select" ></select>
        </div>
        <div class="ref-info-container">
            <div class="main-element">
                <span>Source:</span>
                <a id="source-text"></a>
            </div>
            <div class="main-element">
                <span>Target:</span>
                <a id="target-text"></a>
            </div>
        </div>
        <div class="color-detail-container">
            <div id="sliderWrapper"></div>
            <div class="color-list">
                <div class="cor-detail" id="refactoring-detail">
                    <span class="square ref-marker"></span>
                    <span>Refactoring</span>
                </div>
                <div class="cor-detail" id="refactoring-related-detail">
                    <span class="square addref-marker"></span>
                    <span>Refactoring-related</span>
                </div>
                <div class="cor-detail" id="nonref-detail">
                    <span class="square nonref-marker"></span>
                    <span>Non-refactoring</span>
                </div>
            </div>           
        </div>
    `;
    document.body.appendChild(summaryPanel);

    
    document.getElementById('refactoring-detail').addEventListener('click', () => toggleView(relation.REFACTORING));
    document.getElementById('refactoring-related-detail').addEventListener('click', () => toggleView(relation.RELATED_REFACTORING));
    document.getElementById('nonref-detail').addEventListener('click', () => toggleView(relation.NON_REFACTORING));

    const targetText = document.getElementById('target-text');
    const sourceText = document.getElementById('source-text');

    function setRefactoringSelect() {
        const oldSelect = document.getElementById('refactoring-select');
        const newSelect = oldSelect.cloneNode(false);
        newSelect.id = 'refactoring-select';
        oldSelect.parentNode.replaceChild(newSelect, oldSelect);

        let index = 0;
        data.forEach(ref => {
            const option = document.createElement('option');
            option.value = index;
            const type = ref.type + "_" + (++index);
            option.textContent = type;
            newSelect.appendChild(option);
        });
        newSelect.addEventListener('change', (event) => {
            const selectedOption = event.target.value;
            targetText.innerHTML = data[selectedOption].target[0].element;
            sourceText.innerHTML = data[selectedOption].source[0].element;
            currentRefactoringIndex = selectedOption;
            applyClasses(selectedOption);
            setDistanceSlider(0, maxDistance);
        });

        targetText.innerText = data[currentRefactoringIndex].target[0].element;
        targetText.addEventListener('click', () =>
            goToAnchor(
                "right",
                data[currentRefactoringIndex].target[0].file,
                getPosition(data[currentRefactoringIndex].target[0].local)
            ));
        sourceText.innerText = data[currentRefactoringIndex].source[0].element;
        sourceText.addEventListener('click', () =>
            goToAnchor(
                "left",
                data[currentRefactoringIndex].source[0].file,
                getPosition(data[currentRefactoringIndex].source[0].local)
            ));
    }

    setRefactoringSelect();
    setDistanceSlider(0, maxDistance);
}

function setDistanceSlider(min, max) {

    max = max || 0;

    function updateSliderValue() {
        const slider = document.getElementById('dynamicSlider');
        const currentValue = document.getElementById('currentValue');
        currentValue.textContent = `Distance: ${slider.value}`;
        maxVisibleDistance = slider.value;
        applyClasses(currentRefactoringIndex);

    }

    const sliderWrapper = document.getElementById('sliderWrapper');
    sliderWrapper.innerHTML = `
        <div class="slider-container">
            <div id="currentValue"> Distance: ${max}</div>
            <div class="slider-labels">
                <span id="minValue">Min: ${min}</span>
                <span id="maxValue">Max: ${max}</span>
            </div>
            <input type="range" id="dynamicSlider" min="${min}" max="${max}" value="${max > 0 ? 1 : 0}">
        </div>
    `;

    const slider = document.getElementById('dynamicSlider');
    slider.addEventListener('input', updateSliderValue);

    updateSliderValue();
}

function goToAnchor(side, file, local) {

    const anchorElementsList = htmlelements[file][side][local.lineBegin];
    if (anchorElementsList?.length > 0) {
        anchorElementsList[0].element.scrollIntoView();
    } else {
        let closestLine = null;
        let closestLineElement = null;
        let line = local.lineBegin;
        Object.keys(htmlelements[file][side]).forEach(anchorLine => {
            if (!closestLine || Math.abs(line - closestLine) > Math.abs(line - anchorLine)) {
                closestLine = anchorLine;
                closestLineElement = htmlelements[file][side][anchorLine][0]?.element || closestLineElement;
            }
        });

        if (closestLineElement) {
            closestLineElement.scrollIntoView();
        }
    }
}

function toggleView(relation) {
    const visibility = !relation.visible
    relation.visible = visibility;
    if (visibility) {
        document.getElementById(relation.filter).style.opacity = 1;
    } else {
        document.getElementById(relation.filter).style.opacity = 0.15;
    }

    applyClasses(currentRefactoringIndex);
}

function mapElements() {
    htmlelements = {};
    const fileHeaders = document.querySelectorAll('.file-header');
    fileHeaders.forEach(header => {

        //Create a link to each file path
        const file = htmlelements[header.getAttribute('data-path')] ??= { element: header, left: {}, right: {} };
        const commentButtons = header.parentElement.querySelectorAll('.add-line-comment');
        commentButtons.forEach(commentButton => {

            let lineNumber = commentButton.getAttribute('data-line');
            let side = commentButton.getAttribute('data-side');
            const parent = commentButton.parentElement;
            const splitView = parent.getAttribute('data-split-side');

            if (splitView) {
                side = splitView;
                lineNumber = parent.previousElementSibling.getAttribute('data-line-number')
            }
            file[side] ??= {};

            const codeLines = parent.querySelectorAll('.blob-code-inner');
            const codeLine = file[side][lineNumber] ??= [];

            codeLines.forEach(lineText => {
                let currentColumn = 0;
                const codeNodes = lineText.childNodes;
                codeNodes.forEach(node => {

                    let span = node;
                    if (node.nodeType === Node.TEXT_NODE) {
                        const newSpan = document.createElement('span');
                        newSpan.textContent = node.textContent;
                        span = newSpan;
                        lineText.replaceChild(newSpan, node);
                    }
                    const spanText = span.innerText || "";
                    const spanLength = spanText.length;
                    span.classList.add('anchor-item')
                    codeLine.push({
                        code: spanText,
                        columnbegin: currentColumn + 1,
                        columnEnd: currentColumn + spanLength,
                        element: span,
                        data: {}
                    });
                    currentColumn += spanLength;
                });

            });
        });
    });

    applyClasses(currentRefactoringIndex);
}

function applyClasses(index) {

    const relatedModification = data[index].related.concat(data[index].notRelated).sort(function (a, b) {
        return b.distance - a.distance;
    });

    function clearPreviousStyle(chunk) {
        chunk.element.classList.remove('highlight-nonrefactoring', 'highlight-additional', 'highlight-refactoring', 'rcid_' + chunk.data?.rcid);
        chunk.element.title = '';
        chunk.element.style = '';
        chunk.data = {};
    }
    //Clear previous classes
    currentChangedElements.forEach(chunk => {
        clearPreviousStyle(chunk);
    })

    currentChangedElements = [];
    maxDistance = null;
    if (relatedModification.length > 0) {

        relatedModification.forEach((rc) => {

            rc.id = generateRandomID(15);
            let isNotRelated = rc.relationType == "NOT_RELATED";

            if (!maxDistance && !isNotRelated) {
                maxDistance = rc.distance;
            }

            const rclocal = getPosition(rc.Local);

            if (rclocal) {
                const side = rc.Metric.startsWith("REMOVED") ? "left" : "right";

                //If it is a declararion, consider only the first the declaration line
                if ((rc.Metric == "REMOVED_METHOD" || rc.Metric == "ADDED_METHOD") && rc.Detail?.blockPos) {
                    const bodyPos = getPosition(rc.Detail.blockPos);
                    rclocal.lineEnd = bodyPos.lineBegin;
                    rclocal.columnEnd = bodyPos.columnBegin;
                }

                for (const lineNumber of Object.keys(htmlelements[rc.file][side])) {
                    const codePerLine = htmlelements[rc.file][side][lineNumber];
                    codePerLine.forEach(chunk => {

                        let shouldApplyColor = true;

                        //Avoid mapping null elements
                        if (chunk.code.trim() == "" && (chunk.columnbegin == 0 || chunk.columnbegin == 1)) {
                            return;
                        }

                        if (lineNumber >= rclocal.lineBegin && lineNumber <= rclocal.lineEnd) {
                            if (lineNumber == rclocal.lineBegin && chunk.columnbegin < rclocal.columnBegin) {
                                shouldApplyColor = false;
                            }

                            if (lineNumber == rclocal.lineEnd && chunk.columnEnd - 1 > rclocal.columnEnd) {
                                shouldApplyColor = false;
                            }
                        } else {
                            shouldApplyColor = false;
                        }

                        const chunkLastCodeLength = chunk.data.codeLength || Number.MAX_VALUE;
                        const chunkLastDistance = chunk.data.distance != null ? chunk.data.distance : Number.MAX_VALUE;

                        //Ignore if it's just a regular line
                        if (!shouldApplyColor) {
                            return;
                        }
                        //If the new relation is more far away, we just ignore
                        if (rc.distance > chunkLastDistance) {
                            return;
                        }

                        //Ignore if it's the same distance, but a high abstraction
                        if (rc.distance == chunkLastDistance && rc.Code.length > chunkLastCodeLength) {
                            return;
                        }

                        //Remove any other previous class
                        clearPreviousStyle(chunk);
                        let chunkRelation = null;
                        if (isNotRelated || rc.distance > maxVisibleDistance) {
                            chunkRelation = relation.NON_REFACTORING;
                        } else if (rc.distance > 0) {
                            chunkRelation = relation.RELATED_REFACTORING;
                        } else {
                            chunkRelation = relation.REFACTORING;

                        }

                        //Ignore due to visibility filter
                        if (!chunkRelation.visible) {
                            return;
                        }

                        chunk.data.relation = chunkRelation;
                        chunk.data.distance = rc.distance;
                        chunk.data.relationType = rc.relationType;
                        chunk.data.line = lineNumber;
                        chunk.data.side = side;
                        chunk.data.codeLength = rc.Code.length;
                        chunk.data.rcid = rc.id;

                        chunk.element.classList.add(chunkRelation.highlightClass);
                        chunk.element.classList.add("rcid_" + rc.id);
                        chunk.element.title = `Distance: ${rc.distance}, Relation: ${rc.relationType}\nMetric: ${rc.Metric}`;
                        if (rc.relationType == "VAR_RELATED") {
                            chunk.element.title+=`\nRelated var:${rc.Detail.previousVar}`
                        }
                        currentChangedElements.push(chunk);

                        //Make sure the color was rendered before getting it
                        setTimeout(() => {
                            let bgColor = getComputedStyle(chunk.element).backgroundColor;
                            let rgba = bgColor.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*(\d+\.?\d*)\)$/);
                            if (rgba) {
                                chunk.element.style.setProperty(
                                    'background-color',
                                    `rgba(${parseInt(rgba[1])}, ${parseInt(rgba[2])}, ${parseInt(rgba[3])}, ${calculateOpacity(rc.distance)})`,
                                    'important'
                                );
                            }
                        }, 0);




                    });

                }

            }
        });
    }

    observerElementPosition();
}

function observerElementPosition() {

    const topMarkerGeneral = document.getElementById('topMarker');
    const bottomMarkerGeneral = document.getElementById('bottomMarker');

    const updateMarkers = (markerClass, hiddenAbove, hiddenBelow) => {
        const topMarker = topMarkerGeneral.getElementsByClassName(markerClass)[0];
        const bottomMarker = bottomMarkerGeneral.getElementsByClassName(markerClass)[0];
        topMarker.textContent = `${hiddenAbove}`;
        bottomMarker.textContent = `${hiddenBelow}`;

        topMarker.style.display = hiddenAbove > 0 ? 'block' : 'none';
        bottomMarker.style.display = hiddenBelow > 0 ? 'block' : 'none';
    };

    const checkVisibility = () => {

        Object.values(relation).forEach((relation) => {
            let hiddenAbove = 0;
            let hiddenBelow = 0;

            const alreadyIncludedLine = {};

            const importantElements = currentChangedElements.filter((changedElement) => changedElement.data.relation == relation);


            let closestAboveDistance = Infinity;
            let closestBelowDistance = Infinity;
            importantElements.forEach(chunk => {
                const rect = chunk.element.getBoundingClientRect();

                const id = chunk.data.side + chunk.data.line;
                if (rect.top < 0 && !alreadyIncludedLine[id]) {
                    alreadyIncludedLine[id] = true;
                    hiddenAbove++;

                    const distanceAbove = -rect.top;
                    if (distanceAbove < closestAboveDistance) {
                        closestAboveDistance = distanceAbove;
                        relation.closestElementAbove = chunk.element;
                    }
                } else if (rect.bottom > window.innerHeight && !alreadyIncludedLine[id]) {
                    alreadyIncludedLine[id] = true;
                    hiddenBelow++;

                    const distanceBelow = rect.bottom - window.innerHeight;
                    if (distanceBelow < closestBelowDistance) {
                        closestBelowDistance = distanceBelow;
                        relation.closestElementBelow = chunk.element;
                    }
                }
            });

            updateMarkers(relation.markerClass, hiddenAbove, hiddenBelow);
        })

    };
    checkVisibility();

    if (!alreadyCheckingScroll) {
        alreadyCheckingScroll = true;
        window.addEventListener('scroll', () => {
            checkVisibility();
        });
    }

}

function calculateOpacity(distance) {
    switch (distance) {
        case 0:
        case 1:
        case 99:
            return 0.99;
        case 2: return 0.85
        case 3: return 0.65
        case 4: return 0.5
        default:
            return 0.3
    }
}

function getPosition(local) {
    const padraoL = /L\[(\d+),(\d+)\]/;
    const padraoC = /C\[(\d+),(\d+)\]/;

    const lMatches = local.match(padraoL);
    const cMatches = local.match(padraoC);
    if (lMatches && cMatches) {
        const lines = [parseInt(lMatches[1]), parseInt(lMatches[2])];
        const columns = [parseInt(cMatches[1]), parseInt(cMatches[2])];
        return { lineBegin: lines[0], lineEnd: lines[1], columnBegin: columns[0], columnEnd: columns[1] };
    }

    return null;
}

function generateRandomID(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}