import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

import { MDCRipple } from '@material/ripple/index';

export default class MdcTabBarTabComponent extends Component {
	// #region Accessed Services
	// #endregion

	// #region Tracked Attributes
	@tracked selected = false;
	// #endregion

	// #region Untracked Public Fields
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.#debug?.(`constructor`);

		this.#controls.select = this?._select;
	}
	// #endregion

	// #region Lifecycle Hooks
	willDestroy() {
		this.#debug?.(`willDestroy`);

		this?.args?.tabbarControls?.registerItem?.(this.#element, null, false);
		this.#controls = {};

		this.#mdcRipple = null;
		this.#element = null;

		super.willDestroy(...arguments);
	}
	// #endregion

	// #region DOM Event Handlers
	@action
	onClick(event) {
		this.#debug?.(`onClick: `, event);
		this?.args?.tabbarControls?.selectItem?.(this.#element, true);
	}
	// #endregion

	// #region Modifier Callbacks
	@action
	onAttributeMutation(mutationRecord) {
		this.#debug?.(`onAttributeMutation: `, mutationRecord);
		if (!this.#element) return;

		this?._setupInitState?.();
		this?.recalcStyles?.();
	}

	@action
	recalcStyles() {
		this.#debug?.(`recalcStyles: re-calculating styling`);
		if (!this.#element) return;

		// Step 1: Reset
		this.#element?.style?.removeProperty?.('--mdc-active-tab-color');

		// Stop if the element is disabled
		if (this.#element?.disabled) return;

		// Step 2: Style / Palette
		const paletteColour = `--mdc-theme-${this?.args?.palette ?? 'primary'}`;
		this.#element?.style?.setProperty?.(
			'--mdc-active-tab-color',
			`var(${paletteColour})`
		);
	}

	@action
	storeElement(element) {
		this.#debug?.(`storeElement: `, element);

		this.#element = element;
		this.#mdcRipple = new MDCRipple(this.#element);

		this?._setupInitState?.();
		this?.recalcStyles?.();

		this?.args?.tabbarControls?.registerItem?.(
			this.#element,
			this.#controls,
			true
		);

		if (!this.#element?.hasAttribute?.('selected')) return;

		this?.args?.tabbarControls?.selectItem?.(this.#element, true);
	}
	// #endregion

	// #region Controls
	@action
	_select(selected) {
		this.#debug?.(`_select: `, selected);
		this.selected = selected;
	}
	// #endregion

	// #region Computed Properties
	get selectedTabIndicator() {
		return this?.args?.selectedTabIndicator ?? 'underline';
	}

	get indicatorLength() {
		return this?.args?.indicatorLength ?? 'full';
	}
	// #endregion

	// #region Private Methods
	_setupInitState() {
		if (this.#element?.disabled) {
			this.#mdcRipple?.deactivate?.();
		} else {
			this.#mdcRipple?.activate?.();
		}
	}
	// #endregion

	// #region Default Sub-components
	// #endregion

	// #region Private Attributes
	#debug = debugLogger('component:mdc-tab-bar-tab');

	#element = null;
	#mdcRipple = null;

	#controls = {};
	// #endregion
}
