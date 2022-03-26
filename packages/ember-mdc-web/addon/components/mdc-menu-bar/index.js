import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class MdcMenuBarComponent extends Component {
	// #region Accessed Services
	// #endregion

	// #region Tracked Attributes
	@tracked open = false;
	// #endregion

	// #region Untracked Public Fields
	controls = {};
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.#debug?.(`constructor`);

		this.controls.registerItem = this?._registerItem;
		this.controls.openItem = this?._openItem;
	}
	// #endregion

	// #region Lifecycle Hooks
	willDestroy() {
		this.#debug(`willDestroy`);
		this.controls = {};

		this.#menuItems?.clear?.();
		this.#element = null;

		super.willDestroy(...arguments);
	}
	// #endregion

	// #region DOM Event Handlers
	// #endregion

	// #region Modifier Callbacks
	@action
	closeSubMenus(event) {
		this.#debug(`closeSubmenus: `, event);
		if (!this?.open) return;

		this.#menuItems?.forEach?.((menuItemControls) => {
			menuItemControls?.open?.(false);
		});

		this.open = false;
	}

	@action
	storeElement(element) {
		this.#debug?.(`storeElement: `, element);
		this.#element = element;

		this.#menuItems?.forEach((menuItemControl) => {
			menuItemControl?.barReady?.();
		});
	}
	// #endregion

	// #region Controls
	@action
	_registerItem(item, controls, register) {
		this.#debug?.(`_registerItem: `, item, controls, register);

		if (!register) {
			this.#menuItems?.delete?.(item);
			return;
		}

		if (this.#menuItems?.has?.(item)) {
			this.#menuItems?.set?.(item, controls);
			return;
		}

		this.#menuItems?.set?.(item, controls);

		if (!this.#element) return;
		controls?.barReady?.();
	}

	@action
	_openItem(item, open) {
		this.#debug?.(`_openItem::${open}: `, item);

		if (!this.#menuItems?.has?.(item)) {
			this.#debug?.(`Item not registered: `, item);
			return;
		}

		this.#menuItems?.forEach((menuItemControl, menuItem) => {
			if (item === menuItem) return;

			this.#debug?.(`_openItem::closing: `, menuItem);
			menuItemControl?.open?.(false);
		});

		const thisItemControl = this.#menuItems?.get?.(item);
		const currentStatus = thisItemControl?.status?.()?.['open'];
		if (open !== currentStatus) {
			this.#debug?.(`_openItem::toggling: `, item);
			thisItemControl?.open?.(open);
		}

		if (this?.open === open) return;

		this.#debug?.(`_openItem::isMenuOpen: ${open}`);
		this.open = open;

		const eventData = {
			menuItem: item,
			open: open
		};

		this?._fireEvent?.('statuschange', eventData);
	}
	// #endregion

	// #region Computed Properties
	get menuComponent() {
		return this?._getComputedSubcomponent?.('menu');
	}

	get triggerEvent() {
		const triggerEvent = this?.open ? 'mouseenter' : 'click';
		this.#debug(`triggerEvent: `, triggerEvent);

		return triggerEvent;
	}
	// #endregion

	// #region Private Methods
	_fireEvent(name, options) {
		this.#debug?.(`_fireEvent::${name}: `, options);
		if (!this.#element) return;

		const status = Object?.assign?.({}, options, { open: this?.open });
		const thisEvent = new CustomEvent(name, {
			detail: {
				id: this.#element?.id,
				status: status
			}
		});

		this.#element?.dispatchEvent?.(thisEvent);
	}

	_getComputedSubcomponent(componentName) {
		const subComponent =
			this?.args?.customComponents?.[componentName] ??
			this.#subComponents?.[componentName];

		this.#debug?.(
			`_getComputedSubcomponent::${componentName}-component`,
			subComponent
		);
		return subComponent;
	}
	// #endregion

	// #region Default Sub-components
	#subComponents = {
		menu: 'mdc-menu'
	};
	// #endregion

	// #region Private Attributes
	#debug = debugLogger('component:mdc-menu-bar');

	#element = null;
	#menuItems = new Map();
	// #endregion
}