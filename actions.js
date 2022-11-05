let IMAGES_LEFT = [];
let IMAGES_RIGHT = [];
const ROUNDS = 1; // Amount of rounds the carousel will shift trough
const CAROUSEL_TIME = 5; // Total time in seconds carousel will spin

function loadImagesLeft() {
    loadImages("left");
}

function loadImagesRight() {
    loadImages("right");
}

function loadImages(side) {
    $("#start-button").prop("disabled", false);
    $(`#images-title-${side}`).html(`Selected ${side}-side images`);
    $(`#random-image-div-${side}`).css("display", "none");

    const images = $(`#images-${side}`);

    for (let file of document.getElementById(`images-input-${side}`).files) {
        let oFReader = new FileReader();
        oFReader.readAsDataURL(file);

        oFReader.onload = function (oFREvent) {
            let data = images.html();
            data += `<img alt="imagepicker.org carousel image" class="img-thumbnail thumbnail" src="${oFREvent.target.result}">`;
            images.html(data);
            if (side === "right") {
                IMAGES_RIGHT.push(oFREvent.target.result);
            } else if (side === "left") {
                IMAGES_LEFT.push(oFREvent.target.result);
            }
        };
    }
    document.getElementById(`images-input-${side}`).value = null;

    pa.track({name: `Load images ${side}`, value: side === "left" ? IMAGES_LEFT.length : IMAGES_RIGHT.length});
}

function pickRandomImage() {
    pa.track({name: 'Pick random image', value: [IMAGES_LEFT.length, IMAGES_RIGHT.length]});

    $("#reset-button").prop("disabled", false);
    $("#pick-button").prop("disabled", true);

    const deleteImage = $("#delete-image")[0].checked;
    const directly = $("#show-directly")[0].checked;

    if (!IMAGES_RIGHT.length || !IMAGES_LEFT.length) {
        $("#information-text").html("No images left");
        $("#random-image-div-left").css("display", "none");
        $("#random-image-div-right").css("display", "none");
    } else {
        const selectedLeft = Math.floor(Math.random() * IMAGES_LEFT.length); // Pick random image
        const selectedRight = Math.floor(Math.random() * IMAGES_RIGHT.length); // Pick random image
        if (directly) {
            setFinalImage("left", selectedLeft, deleteImage);
            setFinalImage("right", selectedRight, deleteImage);
        } else {
            doCarousel("left", selectedLeft, deleteImage);
            doCarousel("right", selectedRight, deleteImage);
        }
    }
}

function doCarousel(side, selected, deleteImage) {
    let totalCarousel = 0; // Total images that will be shown in carousel
    if (side === "left") {
        totalCarousel = ROUNDS * IMAGES_LEFT.length + selected;
    } else if (side === "right") {
        totalCarousel = ROUNDS * IMAGES_RIGHT.length + selected;
    }
    const durations = computeDurations(totalCarousel); // Compute a list of durations for each image display in the carousel
    doCarouselRec(side, 0, durations, deleteImage);
}

function doCarouselRec(side, index, durations, deleteImage) {
    const images = side === "left" ? IMAGES_LEFT : IMAGES_RIGHT;

    index = index % images.length;
    const randomImage = $(`#random-image-${side}`);
    $(`#random-image-div-${side}`).css("display", "");
    if (durations.length > 0) {
        randomImage.prop("src", images[index]);
        randomImage.removeClass("random-selected");
        const duration = durations.shift();
        setTimeout(function () {
            doCarouselRec(side, index + 1, durations, deleteImage);
        }, duration * 1000);
    } else {
        // Freeze and remove image from list
        setFinalImage(side, index, deleteImage);
    }
}

function computeDurations(steps) {
    const times = [];
    for (let i = steps; i > 0; i -= 1) {
        times.push(f(i, steps));
    }
    return times;
}

/**
 * Some beautiful math to create a increasing-time effect in the carousel spin
 */
function f(x, steps) {
    let sigm = 0;
    for (let i = 1; i <= steps; i += 1) {
        sigm += Math.log(i);
    }
    const a = CAROUSEL_TIME / (steps * Math.log(steps) - sigm)
    const c = (CAROUSEL_TIME * Math.log(steps)) / (steps * Math.log(steps) - sigm);
    return -a * Math.log(x) + c;
}

function deleteSelectedImage(side, index) {
    if (side === "left") {
        IMAGES_LEFT.splice(index, 1);
    } else if (side === "right") {
        IMAGES_RIGHT.splice(index, 1);
    }
}

function setFinalImage(side, index, deleteImage) {
    const images = side === "left" ? IMAGES_LEFT : IMAGES_RIGHT;

    let randomImage = $(`#random-image-${side}`);
    $("#random-image-div").css("display", "");
    randomImage.prop("src", images[index]);
    randomImage.addClass("random-selected");
    $("#pick-button").prop("disabled", false);
    if (deleteImage) {
        deleteSelectedImage(side, index);
    }
}

function start() {
    $(`#step-1`).each(function () {
        $(this).css("display", "none");
    })
    $(`#step-2`).each(function () {
        $(this).css("display", "");
    });
    $(`.step-1-clear`).each(function () {
        $(this).html("");
    });

    if (IMAGES_LEFT.length === 0 || IMAGES_RIGHT.length === 0) {
        $("#information-text").html("No images left");
        $("#reset-button").prop("disabled", false);
        $("#pick-button").prop("disabled", true);
        $("#random-image-div-left").css("display", "none");
        $("#random-image-div-right").css("display", "none");
    } else {
        $("#pick-button").prop("disabled", false);
        $("#reset-button").prop("disabled", true);
    }
}

function reset() {
    IMAGES_LEFT = [];
    IMAGES_RIGHT = [];
    $(`#step-1`).each(function () {
        $(this).css("display", "");
    });
    $(`#step-2`).each(function () {
        $(this).css("display", "none");
    })
    $(`.step-2-clear`).each(function () {
        $(this).html("");
    });
    $("#reset-button").prop("disabled", true);
    $("#start-button").prop("disabled", true);
}