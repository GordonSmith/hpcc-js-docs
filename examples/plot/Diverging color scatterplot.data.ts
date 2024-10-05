import { csvParse } from "d3-dsv";

//gistemp = .csv({typed: true});

const dataSources = [
    "https://static.observableusercontent.com/files/1734c862dd51ef67930fef3dcd19e8184bb65c405683f55a085f97ca01c233713a53062c251fe0a6d72f93863fd5f714eadef3c9455b1b4f2ed90546cbc57b32"
];

export default {
    async load() {
        return await Promise.all(dataSources.map(url => {
            return fetch(url).then(response => {
                return response.text().then(text => {
                    return csvParse(text);
                });
            });
        }));
    }
};

