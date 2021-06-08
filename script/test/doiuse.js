const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const doiuse = require('doiuse');
const autoprefixer = require('autoprefixer');
const sass = require('node-sass');

const readDirRecursive = async (dir) => {
    const results = [];
    const list = await fs.promises.readdir(dir);
    if (list.length === 0) {
        return results;
    }
    
    await Promise.all(list.map(async (file) => {
        file = path.resolve(dir, file);
        const stat = await fs.promises.stat(file);
        if (stat && stat.isDirectory()) {
            const res = await readDirRecursive(file);
            results.push(...res);

        } else {
            results.push(file);
        }
    }));
    return results;
};

const getPackageJson = async () => {
    const text = await fs.promises.readFile('package.json');
    return JSON.parse(text);
};

(async () => {
    const packageJson = await getPackageJson();
    const files = await readDirRecursive(path.join('src', 'web'));
    const scssFiles = files.filter(file => file.endsWith('.scss'));

    scssFiles.forEach(scssFile => {
        sass.render({
            file: scssFile,
        }, async (error, result) => {
            if (error) {
                console.error(error);
                return;
            }

            // console.log(scssFile);
            // console.log(result.css.toString());

            await postcss([
                autoprefixer,
                doiuse({
                    browsers: packageJson.browserslist,
                    onFeatureUsage: (usageInfo) => {
                        console.error(usageInfo.message);
                    }
                })
            ])
                .process(result.css.toString(), { from: scssFile });
        });
    });
})();

