import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

import { MDCRipple } from '@material/ripple/index';

export default class MdcListItemComponent extends Component {
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

		this?.args?.listControls?.registerItem?.(this.#element, null, false);
		this.#controls = {};

		this.#mdcRipple = null;
		this.#element = null;

		super.willDestroy(...arguments);
	}
	// #endregion

	// #region DOM Event Handlers
	@action
	onClick() {
		this?.args?.listControls?.selectItem?.(this.#element, !this?.selected);
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
		if (!this.#element) return;

		// Step 1: Reset
		// TODO: Optimize this by unsetting only those properties that have not been utilitized
		// in the current scenario
		this.#element?.style?.removeProperty?.('--mdc-ripple-color');
		this.#element?.style?.removeProperty?.(
			'--mdc-theme-text-primary-on-background'
		);

		this.#element.style.borderRadius = null;

		// Stop if the element is disabled
		if (this.#element?.disabled) return;

		// Step 2: Style / Palette
		if (this?.args?.shaped) {
			this.#element.style.borderRadius = '0 2rem 2rem 0';
		}

		if (this?.args?.palette) {
			this.#element?.style?.setProperty?.(
				'--mdc-ripple-color',
				`var(--mdc-theme-${this?.args?.palette})`
			);
			this.#element?.style?.setProperty?.(
				'--mdc-theme-text-primary-on-background',
				`var(--mdc-theme-${this?.args?.palette})`
			);

			const textElement = this.#element?.querySelector?.(
				'span.mdc-list-item__text'
			);
			if (textElement)
				textElement.style.color = `var(--mdc-theme-${this?.args?.palette})`;

			const primaryTextElement = this.#element?.querySelector?.(
				'span.mdc-list-item__primary-text'
			);
			if (primaryTextElement)
				primaryTextElement.style.color = `var(--mdc-theme-${this?.args?.palette})`;
		}
	}

	@action
	storeElement(element) {
		this.#debug?.(`storeElement: `, element);

		this.#element = element;
		this.#mdcRipple = new MDCRipple(this.#element);

		this?._setupInitState?.();
		this?.recalcStyles?.();

		this?.args?.listControls?.registerItem?.(
			this.#element,
			this.#controls,
			true
		);

		if (!this.#element?.hasAttribute?.('selected')) return;

		this?.args?.listControls?.selectItem?.(this.#element, true);
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
	get iconComponent() {
		return this?._getComputedSubcomponent?.('icon');
	}
	// #endregion

	// #region Private Methods
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

	_setupInitState() {
		if (this.#element?.disabled) {
			this.#mdcRipple?.deactivate?.();
		} else {
			this.#mdcRipple?.activate?.();
		}
	}
	// #endregion

	// #region Default Sub-components
	#subComponents = {
		icon: 'mdc-list/item/icon'
	};
	// #endregion

	// #region Private Attributes
	#debug = debugLogger('component:mdc-list-item');

	#element = null;
	#mdcRipple = null;

	#controls = {};
	// #endregion
}
