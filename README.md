## Extension installation


1. Download the `.zip` file. It is not necessary to decompress the file.
2. Open the URL `chrome://extensions/`.
3. Note that this extension version will only work on the specified commits and on Chromium-based browsers (Edge, Chrome, Brave, Opera, and others).
4. Enable **Developer mode** in the top right corner of the extensions page.
5. Drag and drop the downloaded `.zip` file onto the page.
6. The extension should now appear. Make sure it is activated by checking the bottom right.


OBS: Without running the server, this extension version will only work on the commits used in the experiment.


## Server Run

mvn spring-boot:run 

By default, the extension will expect the server to be running at localhost
