const dataSources = [
    "https://static.observableusercontent.com/files/b6be3f760074b3977c8095ed7fd0cd29d06860ec6b45ea56600e2ea5f03e8b1205c4705712c7866c6818109875824c9ad6b96bb3a40e4a6b43806432c40686bd",
    "https://static.observableusercontent.com/files/1ec3edc43ba66c0db419744c479d1b5118bb405587189f3ad739a10853f6f933d86824e809f4b4ad18053ab33fb5dc7c5f3d6bc601654c8ea976afd5b321f517"
];

export default {
    async load() {
        return await Promise.all(dataSources.map(url => {
            return fetch(url).then(response => {
                return response.json();
            });
        }));
    }
};
