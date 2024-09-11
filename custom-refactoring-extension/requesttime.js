

const urls = ["https://github.com/Activiti/Activiti/commit/12182709dac0244a8e9e1de5adaebe355d13600e",
    "https://github.com/Activiti/Activiti/commit/14721cdd69fe9a5315bd825241e1d683a88ea6f8",
    "https://github.com/airbnb/lottie-android/commit/f970d3a8947e2f5eeaf8c852ec3648137f343732",
    "https://github.com/abel533/Mapper/commit/0bbdd891794d156f31c948ed2fa30367567440d0",
    "https://github.com/alibaba/arthas/commit/7442fba627ad103b8c09f0cc1a21a9f588472df8",
    "https://github.com/alibaba/arthas/commit/ec6456c299e7f5ac09a0f715cad6b1b80a94448f",
    "https://github.com/azkaban/azkaban/commit/b0adb99b3879290be964ab41ddeb0762a356d84d",
    "https://github.com/azkaban/azkaban/commit/bd9e6e4d40e6531ab6162a230b25e9dc9e77935e",
    "https://github.com/discord-jda/JDA/commit/36ee5abffd0a94d77cd1d786d3bcc89993bc86f5",
    "https://github.com/dreamhead/moco/commit/0e6a290452c27d8a851221529ec207655a92c6d1",
    "https://github.com/dreamhead/moco/commit/41fe372180c7b6d4d9f380d5a3865a49b2388b97",
    "https://github.com/dreamhead/moco/commit/424f653e49d81d3aaa2789864034c199d7536faa",
    "https://github.com/Genymobile/gnirehtet/commit/660d6a8cba9b9e8511bfc24d87ae9395214c4cfe",
    "https://github.com/google/android-classyshark/commit/e436fc4e7801319075c4253e96e1c3c2bb421d5a",
    "https://github.com/google/auto/commit/3f69cd2551a72828ef772a22d31e23e061dd0e79",
    "https://github.com/google/google-java-format/commit/33fc5ba56de5a4356db839b5275232d3b9f17b56",
    "https://github.com/signalapp/Signal-Server/commit/33c88ec9e4560bdc78023fdb0963fb48ab907e0f",
    "https://github.com/PhilJay/MPAndroidChart/commit/8e193e26d7f6e3edf0da09c83e4b2a40622c8b8e",
    "https://github.com/osmandapp/OsmAnd/commit/c8612654be119ba040ab9cbd61ad954c8073f8d2",
    "https://github.com/swagger-api/swagger-core/commit/7416ff81fa406afb3adbab87443ceee1b16a7fcd",
    "https://github.com/StarRocks/starrocks/commit/9a26f1907bebb635794c5d126aba67377695f360",
    "https://github.com/StarRocks/starrocks/commit/764655435a10d798e7252a7e2509935c360f7cd2",
    "https://github.com/Activiti/Activiti/commit/00a1451856672b025e71b7cf41867c9234b41469",
    "https://github.com/NanoHttpd/nanohttpd/commit/6aa9777e0f8337050acb378ed5ecbb24e467d85c",
    "https://github.com/apache/storm/commit/f594c20dc5f3547578835e32c2a48cc37f2d6cfd",
    "https://github.com/apache/zookeeper/commit/66646796c2173423655c7faf2b458b658143e6b5",
    "https://github.com/facebook/fresco/commit/9395f70c2ab079027df049bdf1d2123a0a188b13",
    "https://github.com/Tencent/APIJSON/commit/8592367b9082ea552290f8aa4700f4af87a97f27",
    "https://github.com/alibaba/jetcache/commit/e22b1aeac319e6d1127a2b9d9a829dd26e52f5db",
    "https://github.com/apache/shenyu/commit/0cf771320f2442d645335115e9fdb939872d4228",
    "https://github.com/apache/shenyu/commit/0f3a09d8beb6a17dbe2920498cffb4237c6e8db0",
    "https://github.com/apache/shenyu/commit/32a422927c4b2f867d8322952bf997b0c54c2ae4",
    "https://github.com/Activiti/Activiti/commit/af10b5693a9a8ddb2cd6a0340e216fed2145110e",
    "https://github.com/discord-jda/JDA/commit/2b0eff5e10c4d6769015a40c3994653147092bc0",
    "https://github.com/discord-jda/JDA/commit/a77218c44370f9880b336ab09cfb3b80ffd9d062",
    "https://github.com/discord-jda/JDA/commit/b579b3d1cafc3cc7f74f5dd03c411eb87c14d665",
    "https://github.com/Doikki/DKVideoPlayer/commit/fbb79c02dc6ad4e7eb16955fb74157be98e79fb3",
    "https://github.com/Activiti/Activiti/commit/a48199ca0486ec1a37fca746f26ee85efd8e20e8",
    "https://github.com/Activiti/Activiti/commit/47cfe930c81723e04ab6647c04b26e709bd630d4",
    "https://github.com/Activiti/Activiti/commit/4c22d56e58459c2053b02dde680c8056ed4998bd",
    "https://github.com/abel533/Mapper/commit/32fd500bfcfc4b774b63efc29be1ef66b1346848",
    "https://github.com/Konloch/bytecode-viewer/commit/b2f7fcb9e910a13f1a239e74447c496fda66ac80",
    "https://github.com/LMAX-Exchange/disruptor/commit/f0fa2f8fb76571b9037e394b11cb7daafaa04ca9",
    "https://github.com/Activiti/Activiti/commit/3756580e4e3f75ba4c9a080af083dd3f28853231",
    "https://github.com/mybatis/mybatis-3/commit/2188eb2e4e102aa0746b21a8f3a91c22f41d51ca",
    "https://github.com/mybatis/mybatis-3/commit/2a68f4f608bcb1ec225130b43694f458158e0b2b",
    "https://github.com/Tencent/QMUI_Android/commit/ab8208019f4e65930c3bebcf2cb57382dcc8dd97",
    "https://github.com/Tencent/QMUI_Android/commit/8149f13991d2eee3df0f16fdf8e5e05ca6235792"]



const times = [];

async function call(index) {
    const startTime = Date.now(); // Record start time
    const gitURL = urls[index].replace(/\/commit\/.*$/, '.git');
    const commitHash = urls[index].split('/').pop();
    const localhostURL = `http://localhost:8080/fromCommit?gitURL=${encodeURIComponent(gitURL)}&commitHash=${commitHash}`;
    try {
        const response = await fetch(localhostURL);
        const endTime = Date.now();
        const timespent = endTime - startTime;
        times.push(timespent);
        console.log(index, timespent);
      
        if (index+1 < urls.length) {
            call(++index);
        } else {
            console.log('Times for each request:', times);
        }
    } catch (error) {
        console.error(`Error processing ${url}:`, error);
    }

}

call(0);