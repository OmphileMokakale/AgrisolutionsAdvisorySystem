alert('Have Fun :-)');
const image = document.getElementById('image');
const result = document.getElementById('result');
const probability = document.getElementById('probability');
probability.innerHTML = 'Apple Ceder';
document.getElementById('getval').addEventListener('change', readURL, true);

function readURL() {
    var file = document.getElementById("getval").files[0];
    if (file) {
        var reader = new FileReader();

        reader.onload = function (e) {
            image.src = e.target.result;
            ml5.imageClassifier('MobileNet')
                .then(classifier => classifier.classify(image)
                    .then(results => {
                        result.innerText = results[0].label;
                        probability.innerText = results[0].confidence.toFixed(4);

                    })
                )

        };

        reader.readAsDataURL(file);
    }
}