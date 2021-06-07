var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "jquery"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GalleryLib = void 0;
    var jquery_1 = __importDefault(require("jquery"));
    function buildAnimName(val) {
        return 'wb-anim-' + val.effect
            + (val.direction ? ('-' + val.direction) : '');
    }
    function buildAnimCss(val) {
        if (!val)
            return { animation: 'none' };
        return {
            animation: buildAnimName(val)
                + ' ' + val.duration + 's'
                + ' ' + val.timing
                + ' ' + val.delay + 's',
            'animation-iteration-count': val.loop ? 'infinite' : 1,
        };
    }
    var config = {
        thumbWidth: 290,
        thumbHeight: 290,
        minWidth: 320,
        minHeight: 240
    };
    var GalleryLib = (function () {
        function GalleryLib(data) {
            var _this = this;
            this.type = "thumbs";
            this.slideshowInterval = 5;
            this.slideshowSpeed = 400;
            this.images = [];
            this.imageIndex = 0;
            this.slideshowTimer = 0;
            this.displayedImage = null;
            this.loadingImage = null;
            this.listImgCont = null;
            this.thumbImgCont = null;
            this.fullThumbWidth = 0;
            this.fullThumbHeight = 0;
            this.bgColor = "";
            this.padding = 0;
            this.imageCover = false;
            this.disablePopup = false;
            this.hideArrows = false;
            this.slideOpacity = 100;
            this.thumbWidth = config.thumbWidth;
            this.thumbHeight = config.thumbHeight;
            this.thumbAlign = "left";
            this.thumbPadding = 6;
            this.thumbAnim = null;
            this.showPictureCaption = "always";
            this.imageElems = {};
            this.lightBox = null;
            this.initialRender = false;
            this.lightBoxDisplayed = false;
            this.invalid = false;
            this.resizeEventHandler = null;
            this.transitionendEventHandler = null;
            this.delayedUpdateTimeout = 0;
            this.metaUpdateTimeout = 0;
            this.elem = jquery_1.default('<div>').addClass('wb_gallery');
            this.id = data.id ? data.id : 'wb-gallery-id';
            this.border = data.border ? data.border : { border: '5px none #FFFFFF' };
            this.thumbWidth = (typeof data.thumbWidth === 'number' && data.thumbWidth > 0)
                ? data.thumbWidth
                : config.thumbWidth;
            this.thumbHeight = (typeof data.thumbHeight === 'number' && data.thumbHeight > 0)
                ? data.thumbHeight
                : config.thumbHeight;
            this.thumbAlign = data.thumbAlign ? data.thumbAlign : this.thumbAlign;
            this.thumbPadding = data.thumbPadding ? data.thumbPadding : this.thumbPadding;
            if (data.thumbAnim)
                this.thumbAnim = data.thumbAnim;
            this.padding = (data.padding || data.padding === 0) ? data.padding : 0;
            this.type = data.type ? data.type : this.type;
            this.slideshowInterval = (typeof data.interval === 'number') ? data.interval : 10;
            this.imageCover = (typeof data.imageCover === 'boolean') ? data.imageCover : this.imageCover;
            this.disablePopup = (typeof data.disablePopup === 'boolean') ? data.disablePopup : this.disablePopup;
            this.hideArrows = (typeof data.hideArrows === 'boolean') ? data.hideArrows : this.hideArrows;
            this.slideOpacity = (typeof data.slideOpacity === 'number') ? data.slideOpacity : this.slideOpacity;
            this.slideshowSpeed = (typeof data.speed === 'number') ? data.speed : 400;
            this.setBgColor(data.bgColor ? data.bgColor : 'transparent');
            this.showPictureCaption = (typeof data.showPictureCaption === 'string') ? data.showPictureCaption : this.showPictureCaption;
            if (data.captionBackground)
                this.setCaptionBackground(data.captionBackground);
            if (data.captionTitleStyle)
                this.setCaptionTitleStyle(data.captionTitleStyle);
            if (data.captionDescriptionStyle)
                this.setCaptionDescriptionStyle(data.captionDescriptionStyle);
            if (!('wb_builder' in window)) {
                this.initialRender = true;
            }
            this.setImages((data.images && data.images.length) ? data.images : []);
            if (data.trackResize) {
                this.resizeEventHandler = function () { return _this.handleResize(); };
                jquery_1.default(window).on('resize', this.resizeEventHandler);
            }
            this.transitionendEventHandler = function (e) {
                if (jquery_1.default(e.target).is(".wb-viewport-block"))
                    _this.handleResize();
            };
            jquery_1.default(window).on('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', this.transitionendEventHandler);
        }
        GalleryLib.prototype.setVisible = function (visible) {
            this.elem.css('display', visible ? 'block' : 'none');
        };
        GalleryLib.prototype.appendTo = function (container) {
            jquery_1.default(container).append(this.elem);
            this.handleResize();
        };
        GalleryLib.prototype.destroy = function () {
            var _a;
            if (this.slideshowTimer)
                clearInterval(this.slideshowTimer);
            if (this.type === "masonry" && this.listImgCont)
                this.listImgCont.masonry("destroy");
            (_a = this.lightBox) === null || _a === void 0 ? void 0 : _a.destroy();
            if (this.resizeEventHandler)
                jquery_1.default(window).off('resize', this.resizeEventHandler);
            if (this.transitionendEventHandler)
                jquery_1.default(window).off('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', this.transitionendEventHandler);
            this.elem.remove();
        };
        GalleryLib.prototype.reset = function (callback) {
            var _this = this;
            if (this.slideshowTimer)
                clearInterval(this.slideshowTimer);
            if (this.slideshowInterval && this.images.length > 1) {
                this.slideshowTimer = setInterval(function () { return _this.slideshowNext(callback); }, this.slideshowInterval * 1000);
            }
            else
                this.slideshowTimer = 0;
        };
        GalleryLib.prototype.invalidate = function () {
            var _this = this;
            if (!this.invalid) {
                this.invalid = true;
                if ("requestAnimationFrame" in window)
                    requestAnimationFrame(function () { return _this.revalidate(); });
                else
                    setTimeout(function () { return _this.revalidate(); }, 0);
            }
            return this;
        };
        GalleryLib.prototype.revalidate = function () {
            this.invalid = false;
            this.render();
            return this;
        };
        GalleryLib.prototype.applyAnimation = function (img, i, layoutReady) {
            img.css(buildAnimCss());
            if (this.thumbAnim && this.thumbAnim.normal) {
                var anim_1 = this.thumbAnim.normal;
                img.addClass('wb-anim-entry')
                    .removeClass('wb-anim-entry-on');
                var func = function () { return setTimeout(function () {
                    img.css(buildAnimCss(__assign(__assign({}, anim_1), { delay: 0 })));
                    setTimeout(function () { return img.addClass('wb-anim-entry-on')
                        .removeClass('wb-anim-entry'); }, 40);
                }, (anim_1.delay * 1000 * i)); };
                if (layoutReady)
                    layoutReady.done(func);
                else
                    func();
            }
            if (this.thumbAnim && this.thumbAnim.hover) {
                var anim = this.thumbAnim.hover;
                var hoverOff_1 = buildAnimCss();
                var hoverOn_1 = buildAnimCss(anim);
                img.addClass(buildAnimName(anim))
                    .off('mouseover')
                    .on('mouseover', function () { return img.css(hoverOn_1); })
                    .off('mouseout')
                    .on('mouseout', function () { return img.css(hoverOff_1); });
                if (anim.loop)
                    img.addClass('loop');
            }
        };
        GalleryLib.prototype.render = function () {
            if (this.slideshowTimer)
                clearInterval(this.slideshowTimer);
            this.slideshowTimer = 0;
            this.listImgCont = null;
            this.displayedImage = null;
            this.loadingImage = null;
            this.elem.empty();
            if (this.images.length == 0)
                return;
            switch (this.type) {
                case "slideshow":
                    this.renderSlideshow();
                    break;
                case "list":
                    this.renderList();
                    break;
                case "masonry":
                    this.renderMasonry();
                    break;
                default:
                    this.renderThumbs();
                    break;
            }
        };
        GalleryLib.prototype.renderThumbs = function () {
            this.elem.html('<div class="wb-thumbs-only" style="width: 100%; height: 100%; overflow: auto;"></div>');
            this.elem.css("text-align", this.thumbAlign);
            var elem = this.elem.children().first();
            for (var i = 0, c = this.images.length; i < c; i++) {
                var img = this.addImage(elem, this.images[i], i).wrp;
                this.applyAnimation(img, i);
            }
            elem.children('.wb_thumb').css('padding', (this.thumbPadding / 2) + 'px');
        };
        GalleryLib.prototype.renderSlideshow = function () {
            var _this = this;
            this.elem.html('<div class="gallery-slideshow">' +
                '<div class="gallery-slide-image" style="overflow: hidden;"></div>' +
                '<div class="gallery-slide-left"><i class="fa fa-chevron-left"></i></div>' +
                '<div class="gallery-slide-right"><i class="fa fa-chevron-right"></i></div>' +
                '</div>');
            var cont = this.elem.children().first();
            var larr = cont.children(".gallery-slide-left");
            var rarr = cont.children(".gallery-slide-right");
            if (this.hideArrows) {
                larr.css('display', 'none');
                rarr.css('display', 'none');
            }
            this.listImgCont = cont.children(".gallery-slide-image");
            this.listImgCont.css('opacity', this.slideOpacity / 100);
            larr.click(function () { return _this.slideshowPrev(); });
            rarr.click(function () { return _this.slideshowNext(); });
            this.reset();
            this.imageIndex = -1;
            this.slideshowNext();
        };
        GalleryLib.prototype.renderList = function () {
            var _this = this;
            var h = this.elem.height();
            if (!h)
                h = this.elem.parent().height();
            var tw = this.getThumbWidth();
            var th = this.getThumbHeight();
            var thumbcont = jquery_1.default("<div></div>");
            var callback = function () {
                var img = _this.imageElems[_this.imageIndex];
                if (!img.parentNode || !img.parentNode.parentNode || !img.parentNode.parentNode.parentNode)
                    return;
                jquery_1.default(img.parentNode.parentNode.parentNode).children(".tmb-selected").removeClass("tmb-selected");
                jquery_1.default(img.parentNode.parentNode).addClass("tmb-selected");
            };
            this.imageElems = {};
            var _loop_1 = function (i) {
                var image = this_1.images[i];
                var img = this_1.addImage(thumbcont, image, i, true).img;
                img.css({ cursor: "pointer" });
                this_1.imageElems[i] = img.get(0);
                img.click(function () {
                    if (!_this.listImgCont)
                        return;
                    _this.imageIndex = _this.images.indexOf(image);
                    _this.displayImage(_this.listImgCont, callback);
                });
                var par = img.parent().parent();
                if (i === this_1.imageIndex) {
                    par.addClass("tmb-selected");
                    tw = this_1.getThumbWidth() + 8;
                    th = this_1.getThumbHeight() + 8;
                }
            };
            var this_1 = this;
            for (var i = 0; i < this.images.length; i++) {
                _loop_1(i);
            }
            this.fullThumbWidth = tw;
            this.fullThumbHeight = th;
            var thumbsWidth = tw * this.images.length;
            thumbcont.css({ position: "absolute", left: "0", top: "5px", width: thumbsWidth + "px", height: th + "px" });
            var galcont = document.createElement("DIV");
            jquery_1.default(galcont).css({ position: "relative", height: h + "px" });
            galcont.className = "gallery-list";
            var imgcont = document.createElement("DIV");
            jquery_1.default(imgcont).css({ position: "relative", height: (h - th - 10) + "px", overflow: "hidden" });
            imgcont.className = "gallery-list-image";
            var icon;
            var thumbdiv_in1 = document.createElement("DIV");
            jquery_1.default(thumbdiv_in1).css({ position: "relative", "float": "left", width: "16px", height: (th + 10) + "px", cursor: "pointer" });
            thumbdiv_in1.className = "gallery-list-left";
            jquery_1.default(thumbdiv_in1).click(function () { return _this.slideBy(-_this.fullThumbWidth * 3); });
            icon = document.createElement("I");
            icon.setAttribute("class", "fa fa-chevron-left");
            thumbdiv_in1.appendChild(icon);
            var thumbdiv_in2 = document.createElement("DIV");
            jquery_1.default(thumbdiv_in2).css({
                position: "relative",
                "float": "none",
                margin: "0 auto",
                maxWidth: thumbsWidth + "px",
                height: (th + 10) + "px",
                overflow: "hidden",
            });
            thumbdiv_in2.className = "gallery-list-thumbs";
            var thumbdiv_in3 = document.createElement("DIV");
            jquery_1.default(thumbdiv_in3).css({ position: "relative", "float": "right", width: "16px", height: (th + 10) + "px", cursor: "pointer" });
            thumbdiv_in3.className = "gallery-list-right";
            jquery_1.default(thumbdiv_in3).click(function () { return _this.slideBy(_this.fullThumbWidth * 3); });
            icon = document.createElement("I");
            icon.setAttribute("class", "fa fa-chevron-right");
            thumbdiv_in3.appendChild(icon);
            var thumbdiv = document.createElement("DIV");
            jquery_1.default(thumbdiv).css({ position: "relative", height: (th + 10) + "px", overflow: "hidden" });
            jquery_1.default(thumbdiv_in2).append(thumbcont);
            thumbdiv.appendChild(thumbdiv_in1);
            thumbdiv.appendChild(thumbdiv_in3);
            thumbdiv.appendChild(thumbdiv_in2);
            galcont.appendChild(imgcont);
            galcont.appendChild(thumbdiv);
            this.listImgCont = jquery_1.default(imgcont);
            this.thumbImgCont = jquery_1.default(thumbdiv_in2);
            this.elem.append(galcont);
            this.reset(callback);
            this.imageIndex = -1;
            this.slideshowNext(callback);
        };
        GalleryLib.prototype.renderMasonry = function () {
            var elem = jquery_1.default('<div class="wb-masonry-items"/>');
            var cont = jquery_1.default('<div class="wb-masonry" style="width: 100%; height: 100%; overflow: auto;"/>');
            cont.append(elem);
            this.elem.append(cont);
            if (this.thumbAlign === "left")
                elem.css("float", "left");
            else if (this.thumbAlign === "right")
                elem.css("float", "right");
            else
                elem.css("margin", "0 auto");
            var layoutReady = jquery_1.default.Deferred();
            for (var i = 0, c = this.images.length; i < c; i++) {
                var img = this.addImage(elem, this.images[i], i).wrp;
                this.applyAnimation(img, i, layoutReady.promise());
            }
            elem.children('.wb_thumb').css('padding', (this.thumbPadding / 2) + 'px');
            var brd = this.getBorder();
            elem.masonry({
                itemSelector: ".wb_thumb",
                columnWidth: this.getThumbWidth() + (brd ? this.getBorderWidth(brd, 1) + this.getBorderWidth(brd, 3) : 0) + this.thumbPadding,
                fitWidth: true,
                transitionDuration: 0
            }).masonry('once', 'layoutComplete', function () { return layoutReady.resolve(); });
            this.listImgCont = elem;
        };
        GalleryLib.prototype.onImageLoad = function () {
            var _this = this;
            if (this.delayedUpdateTimeout)
                clearTimeout(this.delayedUpdateTimeout);
            this.delayedUpdateTimeout = setTimeout(function () {
                _this.delayedUpdateTimeout = 0;
                if (_this.type === "masonry") {
                    _this.elem.find(".wb-masonry-items").masonry();
                    _this.elem.trigger("elementviewchange");
                }
            }, 1000);
        };
        GalleryLib.prototype.getBorderWidth = function (css, side) {
            if (side === void 0) { side = 0; }
            var border = '';
            if (side == 1 && typeof css.borderLeft === 'string')
                border = css.borderLeft;
            if (side == 1 && typeof css['border-left'] === 'string')
                border = css['border-left'];
            if (side == 3 && typeof css.borderRight === 'string')
                border = css.borderRight;
            if (side == 3 && typeof css['border-right'] === 'string')
                border = css['border-right'];
            if (!border && typeof css.border === 'string')
                border = css.border;
            var res = border.match(/^([0-9]+)px(?:| .+)$/);
            if (res)
                return parseFloat(res[1]);
            return 0;
        };
        GalleryLib.prototype.slideBy = function (delta, instant) {
            if (instant === void 0) { instant = false; }
            if (!this.thumbImgCont)
                return;
            var cont = this.thumbImgCont;
            var div = cont.children().first();
            var pos = div.position();
            var x = pos.left;
            x -= delta;
            var minx = -(div.width() - cont.width());
            if (x < minx)
                x = minx;
            if (x > 0)
                x = 0;
            var css = { left: x + "px" };
            if (instant)
                div.stop(true, false).css(css);
            else
                div.animate(css);
        };
        GalleryLib.prototype.handleContinuousResize = function () {
            if (!this.listImgCont)
                return;
            if (this.type === "masonry") {
                this.listImgCont.masonry();
            }
        };
        GalleryLib.prototype.handleResize = function () {
            if (!this.listImgCont)
                return;
            if (this.type === "list") {
                var h = this.elem.height();
                var th = this.fullThumbHeight;
                this.listImgCont.css({ height: (h - th - 10) + "px" });
                this.slideBy(0, true);
            }
            else if (this.type === "masonry") {
                this.listImgCont.css('width', '');
                this.listImgCont.masonry();
            }
            if (this.displayedImage)
                this.updateImageSize(this.displayedImage);
            if (this.loadingImage)
                this.updateImageSize(this.loadingImage);
        };
        GalleryLib.prototype.updateImageSize = function (imageCont) {
            if (!this.listImgCont)
                return;
            var size = imageCont.data("_wb_size_");
            var stl = this.calcImageStyles(this.listImgCont, size);
            imageCont.css({
                left: stl.x + "px",
                top: stl.y + "px"
            });
            var img = imageCont.children('img').first();
            if (img && img.length) {
                img.css({
                    width: stl.width + "px",
                    height: stl.height + "px"
                });
                var imgRaw = img.get(0);
                imgRaw.width = stl.width;
                imgRaw.height = stl.height;
            }
        };
        GalleryLib.prototype.calcImageStyles = function (displayCont, image) {
            if (!image)
                return { x: 0, y: 0, width: 0, height: 0 };
            var cover = this.imageCover;
            var pad = cover ? 0 : this.padding;
            var maxWidth = displayCont.innerWidth() - pad * 2;
            var maxHeight = displayCont.innerHeight() - pad * 2;
            var w = image.width;
            var h = image.height;
            if (cover || w > maxWidth || h > maxHeight) {
                var ratio1 = w / maxWidth;
                var ratio2 = h / maxHeight;
                var ratio = cover ? Math.min(ratio1, ratio2) : Math.max(ratio1, ratio2);
                w = Math.floor(w / ratio);
                h = Math.floor(h / ratio);
            }
            return {
                x: Math.floor((maxWidth - w) / 2 + pad),
                y: Math.floor((maxHeight - h) / 2 + pad),
                width: w,
                height: h
            };
        };
        GalleryLib.prototype.parseHash = function () {
            var hash = window.location.hash.substring(1), params = { gid: '', pid: '' };
            if (hash.length < 5) {
                return params;
            }
            var vars = hash.split('&');
            for (var i = 0; i < vars.length; i++) {
                if (!vars[i]) {
                    continue;
                }
                var pair = vars[i].split('=');
                if (pair.length < 2) {
                    continue;
                }
                if (i == 1 && pair) {
                    params.gid = pair[1];
                }
                if (i == 2 && pair) {
                    params.pid = pair[1];
                }
            }
            return params;
        };
        GalleryLib.prototype.displayImage = function (displayCont, callback) {
            var _this = this;
            if (typeof callback === 'function')
                callback();
            var image = this.images[this.imageIndex];
            if (!image)
                return;
            var link = (this.type !== "thumbs" && this.type !== "masonry" && image.link) ? image.link : undefined;
            var cont = (link ? jquery_1.default('<a>') : jquery_1.default('<div>')).addClass("gallery-image");
            if (link) {
                cont.attr('href', link.url);
                if (link.target)
                    cont.attr('target', link.target);
            }
            if (image.title)
                cont.attr('title', image.title);
            cont.data("image", image);
            cont.css({ display: "none", position: "absolute" });
            var img = new Image(), imgJq = jquery_1.default(img);
            img.alt = "";
            img.onload = function () {
                if (_this.displayedImage) {
                    var caption_1 = _this.displayedImage.data("caption");
                    _this.displayedImage.fadeOut(_this.getTransitionSpeed(), function () {
                        if (_this.displayedImage)
                            _this.displayedImage.remove();
                    });
                    if (caption_1) {
                        caption_1.fadeOut(_this.getTransitionSpeed(), function () { return caption_1.remove(); });
                    }
                }
                var size = { width: img.width, height: img.height };
                cont.data("_wb_size_", size);
                cont.append(img);
                var stl = _this.calcImageStyles(displayCont, size);
                cont.css({ left: stl.x + "px", top: stl.y + "px" });
                imgJq.css({ width: stl.width + "px", height: stl.height + "px" });
                img.width = stl.width;
                img.height = stl.height;
                cont.fadeIn(_this.getTransitionSpeed(), function () {
                    if (_this.displayedImage)
                        _this.displayedImage.remove();
                    var parent = cont.parent();
                    _this.displayedImage = (parent && parent.length) ? cont : null;
                    _this.loadingImage = null;
                });
            };
            imgJq.css((this.imageCover || !this.border) ? { "border": "none" } : this.border);
            displayCont.append(cont);
            this.loadingImage = cont;
            var caption = jquery_1.default('<div class="wb-picture-caption" style="display: none;"/>');
            if (this.captionBackground)
                caption.css("background-color", this.captionBackground);
            if (this.fillCaptionContainer(caption, image, true)) {
                if (this.showPictureCaption === 'always') {
                    caption.fadeIn(this.getTransitionSpeed());
                    displayCont.append(caption);
                    cont.data("caption", caption);
                }
                else {
                    displayCont.append(caption);
                    cont.data("caption", caption);
                    caption.css({
                        display: 'block',
                        opacity: 0,
                    });
                    displayCont.hover(function () {
                        caption.css('opacity', '1');
                    }, function () {
                        caption.css('opacity', '0');
                    });
                }
            }
            else { }
            img.src = image.src;
            if (!link)
                this.initImageLightBox(imgJq, this.imageIndex);
        };
        GalleryLib.prototype.slideshowNext = function (callback) {
            if (this.images.length === 0 || !this.listImgCont || this.lightBoxDisplayed)
                return;
            this.imageIndex++;
            if (this.imageIndex >= this.images.length)
                this.imageIndex = 0;
            this.displayImage(this.listImgCont, callback);
        };
        GalleryLib.prototype.slideshowPrev = function () {
            if (this.images.length === 0 || !this.listImgCont)
                return;
            this.imageIndex--;
            if (this.imageIndex < 0)
                this.imageIndex = this.images.length - 1;
            this.displayImage(this.listImgCont);
        };
        GalleryLib.prototype.addImage = function (cont, image, idx, noLightbox) {
            var _this = this;
            if (noLightbox === void 0) { noLightbox = false; }
            var isThumbsOnlyMode = (this.type === "thumbs" || this.type === "masonry");
            var link = (isThumbsOnlyMode && image.link) ? image.link : undefined;
            var div = (link ? jquery_1.default('<a>') : jquery_1.default('<div>')).addClass("wb_thumb");
            if (link) {
                div.attr('href', link.url);
                if (link.target)
                    div.attr('target', link.target);
            }
            if (image.title)
                div.attr('title', image.title);
            var tw = this.getThumbWidth();
            var th = this.getThumbHeight();
            var wrp = jquery_1.default("<div/>");
            wrp.css({
                zIndex: "1",
                width: tw + "px",
                overflow: "hidden",
                boxSizing: "content-box",
                position: 'relative'
            });
            if (this.type !== 'masonry')
                wrp.css('height', th + "px");
            var brd = this.getBorder();
            if (isThumbsOnlyMode && brd)
                wrp.css(brd);
            div.append(wrp);
            div.data("image", image);
            var img = jquery_1.default('<img src="" alt="" />');
            var imgRaw = img.get(0);
            var thisCont = cont;
            imgRaw.onload = function () {
                var w = imgRaw.width;
                var h = imgRaw.height;
                var k;
                if (_this.type === 'masonry') {
                    k = w / tw;
                }
                else {
                    var k1 = w / tw;
                    var k2 = h / th;
                    k = Math.min(k1, k2);
                }
                w = w / k;
                h = h / k;
                var x = Math.round((tw - w) / 2);
                var y = (_this.type === 'masonry') ? 0 : Math.round((th - h) / 2);
                img.css({ left: x + "px", top: y + "px", width: w + "px", height: h + "px" });
                setTimeout(function () { return _this.onImageLoad(); }, 100);
            };
            imgRaw.src = image.thumb || image.src;
            img.css({
                display: "block",
                zIndex: "1",
                maxWidth: "auto",
                position: "relative"
            });
            wrp.append(img);
            if (isThumbsOnlyMode && this.getThumbWidth() >= 100) {
                var descDiv_1 = jquery_1.default('<div class="wb-picture-caption"/>');
                if (this.captionBackground)
                    descDiv_1.css("background-color", this.captionBackground);
                if (this.fillCaptionContainer(descDiv_1, image, false)) {
                    wrp.append(descDiv_1);
                    if (this.showPictureCaption === 'hover') {
                        descDiv_1.css({
                            opacity: 0,
                            transition: "opacity " + (this.slideshowSpeed / 1000).toFixed(3) + "s linear"
                        });
                        div.hover(function () {
                            descDiv_1.css('opacity', '1');
                        }, function () {
                            descDiv_1.css('opacity', '0');
                        });
                    }
                }
            }
            cont.append(div);
            if (!noLightbox && !link)
                this.initImageLightBox(img, idx);
            return { img: img, wrp: wrp };
        };
        GalleryLib.prototype.fillCaptionContainer = function (cont, meta, createDescription, createLink) {
            if (createLink === void 0) { createLink = false; }
            var hasAny = false;
            if (meta.title !== "") {
                hasAny = true;
                var title = jquery_1.default('<h3 class="wb-lightbox-title">').append((createLink && meta.link)
                    ? jquery_1.default('<a>').attr({ href: meta.link.url, target: meta.link.target }).text(meta.title)
                    : document.createTextNode(meta.title));
                if (this.captionTitleStyle)
                    title.css(this.captionTitleStyle);
                cont.append(title);
            }
            if (createDescription && meta.description !== "") {
                hasAny = true;
                var desc = jquery_1.default('<div class="wb-lightbox-description">').text(meta.description);
                if (this.captionDescriptionStyle)
                    desc.css(this.captionDescriptionStyle);
                cont.append(desc);
            }
            return hasAny;
        };
        GalleryLib.prototype.updateImageMeta = function (updateImage) {
            for (var _i = 0, _a = this.images; _i < _a.length; _i++) {
                var image = _a[_i];
                if (image.src === updateImage.src) {
                    jquery_1.default.extend(true, image, updateImage);
                    this.onMetaChange();
                    break;
                }
            }
        };
        GalleryLib.prototype.renderMeta = function (image, createDescription, $container, $caption) {
            var isNew;
            if ($caption && $caption.length) {
                $caption.empty();
                isNew = false;
            }
            else {
                $caption = jquery_1.default('<div class="wb-picture-caption"/>');
                isNew = true;
            }
            if (this.captionBackground)
                $caption.css("background-color", this.captionBackground);
            if (this.fillCaptionContainer($caption, image, createDescription)) {
                if (isNew) {
                    $caption.css("opacity", 0);
                    $container.append($caption);
                    $caption.css("opacity", 1);
                }
                return $caption;
            }
            else if (!isNew) {
                $caption.detach();
            }
            return null;
        };
        GalleryLib.prototype.onMetaChange = function () {
            var _this = this;
            if (this.metaUpdateTimeout)
                return;
            this.metaUpdateTimeout = requestAnimationFrame(function () {
                _this.metaUpdateTimeout = 0;
                if (_this.type === "thumbs" || _this.type === "masonry") {
                    if (_this.getThumbWidth() >= 100) {
                        var thisClass_1 = _this;
                        _this.elem.find(".wb_thumb").each(function () {
                            var $thumb = jquery_1.default(this);
                            var image = $thumb.data("image");
                            if (!image)
                                return;
                            $thumb.attr('title', image.title || "");
                            thisClass_1.renderMeta(image, false, $thumb.children().first(), jquery_1.default(".wb-picture-caption", $thumb));
                        });
                    }
                }
                else {
                    var renderListImageMeta = function ($cont, fadeIn) {
                        var $parent = $cont.parent();
                        if (!$parent || !$parent.length)
                            return;
                        var image = $cont.data("image");
                        if (!image)
                            return;
                        $cont.attr('title', image.title || "");
                        var $prevCaption = $cont.data("caption");
                        var $caption = _this.renderMeta(image, true, $parent, $prevCaption);
                        $cont.data("caption", $caption);
                        if ($caption && !$prevCaption) {
                            $caption.addClass("wb-no-transition");
                            var opacity = parseFloat(getComputedStyle($cont[0]).opacity);
                            if (opacity < 1) {
                                $caption.css("opacity", opacity);
                                if (fadeIn)
                                    $caption.fadeTo(Math.floor((1 - opacity) * _this.getTransitionSpeed()), 1);
                                else
                                    $caption.fadeOut(Math.floor(opacity * _this.getTransitionSpeed()), function () { return $caption === null || $caption === void 0 ? void 0 : $caption.remove(); });
                            }
                        }
                    };
                    if (_this.displayedImage)
                        renderListImageMeta(_this.displayedImage, false);
                    if (_this.loadingImage)
                        renderListImageMeta(_this.loadingImage, true);
                    if (_this.type === "list") {
                        jquery_1.default(".wb_thumb", _this.elem).each(function () {
                            var $thumb = jquery_1.default(this);
                            var image = $thumb.data("image");
                            $thumb.attr('title', image.title || "");
                        });
                    }
                }
            });
        };
        GalleryLib.prototype.constructImagesArray = function () {
            var images = [];
            for (var _i = 0, _a = this.images; _i < _a.length; _i++) {
                var image = _a[_i];
                images.push({
                    src: image.src,
                    w: image.width,
                    h: image.height,
                    msrc: null,
                    title: (typeof image.title === 'string' && image.title.length > 0) ? image.title : " ",
                    link: image.link ? image.link : undefined,
                    description: image.description ? image.description : ''
                });
            }
            return images;
        };
        GalleryLib.prototype.initImageLightBox = function (img, imageIndex) {
            var _this = this;
            var lightBoxInited = GalleryLib.lightBoxInited;
            GalleryLib.lightBoxInited = true;
            var params;
            if (this.initialRender) {
                params = this.parseHash();
                imageIndex = params.pid ? parseInt(params.pid) : imageIndex;
            }
            if ((this.type === 'slideshow' || this.type === 'list') && this.disablePopup)
                return;
            var lightBoxElem = jquery_1.default('body > .pswp');
            if (!lightBoxInited && this.initialRender && params && params.pid) {
                this.lightBoxDisplayed = true;
                var images = [];
                images = this.constructImagesArray();
                this.lightBox = (new PhotoSwipe(lightBoxElem.get(0), PhotoSwipeUI_Default, images, {
                    index: imageIndex,
                    addCaptionHTMLFn: function (item, captionElement) {
                        var cont = jquery_1.default(captionElement.children[0]);
                        cont.empty();
                        return _this.fillCaptionContainer(cont, item, true, true);
                    },
                    history: true
                }));
                this.lightBox.init();
                this.lightBox.listen('destroy', function () {
                    _this.lightBoxDisplayed = false;
                });
                this.initialRender = false;
            }
            img.css({ cursor: "pointer" })
                .on("click touchstart touchend touchmove", function (e) {
                var img = jquery_1.default(e.currentTarget);
                if (e.type === 'touchstart') {
                    img.data('pswpDisabled', false);
                }
                else if (e.type === 'touchmove') {
                    img.data('pswpDisabled', true);
                }
                if ((e.type === 'click' || e.type === 'touchend') && !img.data('pswpDisabled')) {
                    _this.lightBoxDisplayed = true;
                    var images = [];
                    images = _this.constructImagesArray();
                    _this.lightBox = (new PhotoSwipe(lightBoxElem.get(0), PhotoSwipeUI_Default, images, {
                        index: imageIndex,
                        addCaptionHTMLFn: function (item, captionElement) {
                            var cont = jquery_1.default(captionElement.children[0]);
                            cont.empty();
                            return _this.fillCaptionContainer(cont, item, true, true);
                        },
                        history: true
                    }));
                    _this.lightBox.init();
                    _this.lightBox.listen('destroy', function () {
                        _this.lightBoxDisplayed = false;
                    });
                    lightBoxElem.attr('id', _this.id + '_pswp');
                }
            });
        };
        GalleryLib.prototype.getImages = function () {
            return __spreadArray([], this.images);
        };
        GalleryLib.prototype.setImages = function (images) {
            this.images = __spreadArray([], images);
            this.invalidate();
        };
        GalleryLib.prototype.getType = function () {
            return this.type;
        };
        GalleryLib.prototype.setType = function (type) {
            this.type = type;
            this.invalidate();
        };
        GalleryLib.prototype.getSlideshowInterval = function () {
            return this.slideshowInterval;
        };
        GalleryLib.prototype.getSlideshowSpeed = function () {
            return this.slideshowSpeed;
        };
        GalleryLib.prototype.setSlideshowSpeed = function (speed) {
            this.slideshowSpeed = speed;
        };
        GalleryLib.prototype.getTransitionSpeed = function () {
            return (this.slideshowInterval > 0) ? Math.min(Math.max(0, this.slideshowInterval * 1000 - 100), this.slideshowSpeed) : 0;
        };
        GalleryLib.prototype.getBgColor = function () {
            return this.bgColor;
        };
        GalleryLib.prototype.setBgColor = function (color) {
            this.bgColor = color;
            this.elem.css("background-color", this.bgColor);
        };
        GalleryLib.prototype.getCaptionBackground = function () {
            return this.captionBackground;
        };
        GalleryLib.prototype.setCaptionBackground = function (color) {
            this.captionBackground = color;
            if (this.captionBackground)
                this.elem.find(".wb-picture-caption").css("background-color", color);
        };
        GalleryLib.prototype.getCaptionTitleStyle = function () {
            return this.captionTitleStyle;
        };
        GalleryLib.prototype.setCaptionTitleStyle = function (css) {
            this.captionTitleStyle = css;
            this.elem.find(".wb-lightbox-title").css(css);
        };
        GalleryLib.prototype.getCaptionDescriptionStyle = function () {
            return this.captionDescriptionStyle;
        };
        GalleryLib.prototype.setCaptionDescriptionStyle = function (css) {
            this.captionDescriptionStyle = css;
            this.elem.find(".wb-lightbox-description").css(css);
        };
        GalleryLib.prototype.setFrequency = function (frequency) {
            if (frequency >= 0 && frequency <= 10) {
                this.slideshowInterval = frequency;
                this.reset();
            }
        };
        GalleryLib.prototype.getFrequency = function () {
            return this.slideshowInterval;
        };
        GalleryLib.prototype.getBorder = function () {
            return this.border;
        };
        GalleryLib.prototype.setBorder = function (border) {
            this.border = border;
            this.elem.find('.gallery-image').css((this.imageCover || !this.border) ? { "border": "none" } : this.border);
            this.invalidate();
        };
        GalleryLib.prototype.getPadding = function () {
            return this.padding;
        };
        GalleryLib.prototype.getThumbWidth = function () {
            return this.thumbWidth ? this.thumbWidth : config.thumbWidth;
        };
        GalleryLib.prototype.getThumbHeight = function () {
            return this.thumbHeight ? this.thumbHeight : config.thumbHeight;
        };
        GalleryLib.prototype.getThumbAlign = function () {
            return this.thumbAlign;
        };
        GalleryLib.prototype.getThumbPadding = function () {
            return this.thumbPadding;
        };
        GalleryLib.prototype.setPadding = function (padding) {
            this.padding = padding;
            this.invalidate();
        };
        GalleryLib.prototype.setThumbWidth = function (width) {
            this.thumbWidth = width;
            this.invalidate();
        };
        GalleryLib.prototype.setThumbHeight = function (height) {
            this.thumbHeight = height;
            this.invalidate();
        };
        GalleryLib.prototype.setThumbAlign = function (align) {
            this.thumbAlign = align;
            this.invalidate();
        };
        GalleryLib.prototype.setThumbPadding = function (padding) {
            this.thumbPadding = padding;
            this.invalidate();
        };
        GalleryLib.prototype.getThumbAnim = function () {
            return this.thumbAnim;
        };
        GalleryLib.prototype.setThumbAnim = function (value) {
            if (value && ('_preview' in value) && value._preview) {
                delete value._preview;
            }
            this.thumbAnim = value;
            this.invalidate();
        };
        GalleryLib.prototype.setImageCover = function (value) {
            this.imageCover = value;
            this.invalidate();
        };
        GalleryLib.prototype.setDisablePopup = function (value) {
            this.disablePopup = value;
            this.invalidate();
        };
        GalleryLib.prototype.setHideArrows = function (hide) {
            this.hideArrows = hide;
            if (this.type === "slideshow") {
                var larr = this.elem.find(".gallery-slide-left");
                var rarr = this.elem.find(".gallery-slide-right");
                if (hide) {
                    larr.css('display', 'none');
                    rarr.css('display', 'none');
                }
                else {
                    larr.css('display', '');
                    rarr.css('display', '');
                }
            }
        };
        GalleryLib.prototype.setSlideOpacity = function (value) {
            this.slideOpacity = value;
            if (this.type === "slideshow" && this.listImgCont) {
                this.listImgCont.css('opacity', this.slideOpacity / 100);
            }
        };
        GalleryLib.prototype.getImageCover = function () {
            return this.imageCover;
        };
        GalleryLib.prototype.getDisablePopup = function () {
            return this.disablePopup;
        };
        GalleryLib.prototype.getHideArrows = function () {
            return this.hideArrows;
        };
        GalleryLib.prototype.getSlideOpacity = function () {
            return this.slideOpacity;
        };
        GalleryLib.prototype.setShowPictureCaption = function (value) {
            this.showPictureCaption = value;
            this.invalidate();
        };
        GalleryLib.prototype.getShowPictureCaption = function () {
            return this.showPictureCaption;
        };
        GalleryLib.lightBoxInited = false;
        return GalleryLib;
    }());
    exports.GalleryLib = GalleryLib;
});
