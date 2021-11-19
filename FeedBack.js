module.exports = () => {
    let feedBackArray = []

    function check(feedBack) {
        if (feedBack.location === 'North West') {
            feedBackArray.push({
                "message": `Hello, ${feedBack.username} based on your location ${feedBack.location}, soil type ${feedBack.soiltype}, land size ${feedBack.landsize} and season, these are the types of crops you can plant: `, 
                "crops": ["Tomatos", "Onions", "Carrots", "Spinach", "Beetroot"],
            });
        }
    }

    function getFeedBack() {
        return feedBackArray;
    }

    return {
        getFeedBack,
        check
    }
}