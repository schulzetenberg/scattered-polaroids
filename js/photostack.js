((window) => {
	'use strict';

	class Photostack {
		constructor(el, options) {
			this.el = el;
			this.options = options;
			this.init();
		}

		init = () => {
			this.inner = this.el.querySelector('div');
			this.allItems = Array.from(this.inner.children);
			this.allItemsCount = this.allItems.length;
			if (!this.allItemsCount) return this.callback('No items to render');
			this.currentItem = this.inner.querySelector('figure:not([data-dummy])');
			this.getSizes();
			this.shuffle();
			window.addEventListener('resize', () => this.resizeHandler());
		};

		resizeHandler = () => {
			const delayed = () => {
				this.resize();
				this.resizeTimeout = null;
			};

			if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
			this.resizeTimeout = setTimeout(delayed, 100);
		};

		resize = () => {
			this.getSizes();
			this.shuffle();
		};

		shuffleArray = (array) => {
			for (let i = array.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[array[i], array[j]] = [array[j], array[i]];
			}
		};

		shuffle = () => {
			const overlapFactor = .5;
			// lines & columns
			const lines = Math.ceil(this.sizes.inner.width / (this.sizes.item.width * overlapFactor));
			const columns = Math.ceil(this.sizes.inner.height / (this.sizes.item.height * overlapFactor));
			// since we are rounding up the previous calcs we need to know how much more we are adding to the calcs for both x and y axis
			const addX = lines * this.sizes.item.width * overlapFactor + this.sizes.item.width / 2 - this.sizes.inner.width;
			const addY = columns * this.sizes.item.height * overlapFactor + this.sizes.item.height / 2 - this.sizes.inner.height;
			// we will want to center the grid
			const extraX = addX / 2;
			const extraY = addY / 2;
			// max and min rotation angles
			const maxrot = 35, minrot = -35;
			this.shuffleArray(this.allItems);

			// translate/rotate items
			const moveItems = () => {
				// create a "grid" of possible positions
				const grid = [];

				// populate the positions grid
				for (let i = 0; i < columns; ++i) {
					const col = grid[i] = [];

					for (let j = 0; j < lines; ++j) {
						const xVal = j * (this.sizes.item.width * overlapFactor) - extraX;
						const yVal = i * (this.sizes.item.height * overlapFactor) - extraY;
						let olx = 0;
						let oly = 0;
						const ol = this.isOverlapping({ x: xVal, y: yVal });

						if (ol.overlapping) {
							olx = ol.noOverlap.x;
							oly = ol.noOverlap.y;
							const r = Math.floor(Math.random() * 3);

							switch(r) {
								case 0: olx = 0; break;
								case 1: oly = 0; break;
							}
						}

						col[j] = { x: xVal + olx, y: yVal + oly };
					}
				}

				let l = 0;
				let c = 0;

				this.allItems.forEach((item) => {
					// pick a random item from the grid
					if (l === lines - 1) {
						c = c === columns - 1 ? 0 : c + 1;
						l = 1;
					} else {
						++l;
					}

					const gridVal = grid[c][l-1];

					if(this.currentItem === item) {
						const translate = `translate(${this.centerItem.x}px,${this.centerItem.y}px) rotate(0deg)`;
						this.currentItem.style.WebkitTransform = translate;
						this.currentItem.style.msTransform = translate;
						this.currentItem.style.transform = translate;
						this.currentItem.classList.add('photostack-current');
					} else {
						const rotation = Math.floor(Math.random() * (maxrot - minrot + 1) + minrot);
						const translate = `translate(${gridVal.x}px,${gridVal.y}px) rotate(${rotation}deg)`;
						item.style.WebkitTransform = translate;
						item.style.msTransform = translate;
						item.style.transform = translate;
					}
				});

				this.callback();
			};

			moveItems();
		};

		callback = (err) => {
			if(typeof this.options.callback === 'function') {
				this.options.callback(err);
			}
		};

		getSizes = () => {
			this.sizes = {
				inner: { width: this.inner.offsetWidth, height: this.inner.offsetHeight },
				item: { width: this.currentItem.offsetWidth, height: this.currentItem.offsetHeight }
			};

			// translation values to center an item
			this.centerItem = {
				x: this.sizes.inner.width / 2 - this.sizes.item.width / 2,
				y: this.sizes.inner.height / 2 - this.sizes.item.height / 2
			};
		};

		isOverlapping = (itemVal) => {
			const dxArea = this.sizes.item.width + this.sizes.item.width / 3; // adding some extra avoids any rotated item to touch the central area
			const dyArea = this.sizes.item.height + this.sizes.item.height / 3;
			const areaVal = { x: this.sizes.inner.width / 2 - dxArea / 2, y: this.sizes.inner.height / 2 - dyArea / 2 };
			const dxItem = this.sizes.item.width;
			const dyItem = this.sizes.item.height;

			if (!((itemVal.x + dxItem) < areaVal.x ||
				itemVal.x > (areaVal.x + dxArea) ||
				(itemVal.y + dyItem) < areaVal.y ||
				itemVal.y > (areaVal.y + dyArea))) {
					// how much to move so it does not overlap?
					// move left / or move right
					const left = Math.random() < 0.5;
					const randExtraX = Math.floor(Math.random() * (dxItem / 4 + 1));
					const randExtraY = Math.floor(Math.random() * (dyItem / 4 + 1));
					const noOverlapX = left ? (itemVal.x - areaVal.x + dxItem) * -1 - randExtraX: (areaVal.x + dxArea) - (itemVal.x + dxItem) + dxItem + randExtraX;
					const noOverlapY = left ? (itemVal.y - areaVal.y + dyItem) * -1 - randExtraY: (areaVal.y + dyArea) - (itemVal.y + dyItem) + dyItem + randExtraY;

					return {
						overlapping: true,
						noOverlap: { x: noOverlapX, y: noOverlapY }
					};
			}

			return { overlapping: false };
		};
	}

	window.Photostack = Photostack;
})(window);
