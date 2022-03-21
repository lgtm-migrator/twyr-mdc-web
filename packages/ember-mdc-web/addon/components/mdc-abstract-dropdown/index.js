import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

import { nextBrowserTick } from '../../utils/next-browser-tick';

export default class MdcAbstractDropdownComponent extends Component {
	// #region Accessed Services
	// #endregion

	// #region Tracked Attributes
	@tracked disabled = false;
	@tracked open = false;
	// #endregion

	// #region Untracked Public Fields
	controls = {};
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.#debug?.(`constructor`);

		this.controls.open = this?._open;
		this.controls.close = this?._close;
		this.controls.toggle = this?._toggle;

		this.controls.register = this?._registerElement;
		this.controls.calcContentPosition = this?._calcContentPosition;
	}
	// #endregion

	// #region Lifecycle Hooks
	willDestroy() {
		this.#debug?.(`willDestroy`);

		this.#triggerElement = null;
		this.#contentElement = null;

		this.controls = {};
		this.#element = null;

		super.willDestroy(...arguments);
	}
	// #endregion

	// #region DOM Event Handlers
	// #endregion

	// #region Modifier Callbacks
	@action
	onAttributeMutation(mutationRecord) {
		this.#debug?.(`onAttributeMutation: `, mutationRecord);
		if (!this.#element) return;

		this?._setupInitState?.();
		this?._fireEvent?.('statuschange');
	}

	@action
	storeElement(element) {
		this.#debug?.(`storeElement: `, element);
		this.#element = element;

		this.open = this.#element?.hasAttribute?.('open');

		this?._setupInitState?.();
		this?._fireEvent?.('init');
	}
	// #endregion

	// #region Controls
	@action
	_open() {
		this.#debug?.(`_open: `, arguments);
		if (this?.open) return;

		if (!this.#element || this.#element?.disabled) return;

		this.open = true;

		this?._setupInitState?.();
		this?._fireEvent?.('statuschange');
	}

	@action
	_close() {
		this.#debug?.(`_close: `, arguments);
		if (!this?.open) return;

		this.open = false;

		this?._setupInitState?.();
		this?._fireEvent?.('statuschange');
	}

	@action
	_toggle() {
		this.#debug?.(`_toggle: `, arguments);
		if (this?.open) this?._close?.();
		else this?._open?.();
	}

	@action
	_registerElement(position, element, register) {
		this.#debug?.(`_registerElement::${position}: `, element);

		if (position === 'trigger') {
			this.#triggerElement = register ? element : null;
		}

		if (position === 'content') {
			this.#contentElement = register ? element : null;
		}

		this?._setupInitState?.();
	}

	@action
	async _calcContentPosition(options) {
		this.#debug?.(`_calcContentPosition::options: `, options);
		const posCalcFunc =
			this?.args?.contentPositionCalculator ||
			this?._contentPositionCalculator?.bind?.(this);

		const contentPosition = await posCalcFunc?.(
			this.#triggerElement?.element,
			this.#contentElement?.element,
			options
		);

		return contentPosition;
	}
	// #endregion

	// #region Computed Properties
	get triggerComponent() {
		return this?._getComputedSubcomponent?.('trigger');
	}

	get contentComponent() {
		return this?._getComputedSubcomponent?.('content');
	}
	// #endregion

	// #region Private Methods
	async _contentPositionCalculator(triggerElement, contentElement, options) {
		this.#debug?.(`_contentPositionCalculator::options: `, options);
		const position = {
			left: null,
			top: null
		};

		const xAlign = options?.xAlign;
		let xOffset = options?.xOffset;
		if (xAlign === 'right') xOffset = -xOffset;

		const yAlign = options?.yAlign;
		let yOffset = options?.yOffset;
		if (yAlign === 'top') yOffset = -yOffset;

		const triggerElementDimensions =
			triggerElement?.getBoundingClientRect?.();

		// Step 1: Set width according to input parameters
		// Init stuff - if we're matching widths, do it now, wait for height to settle
		if (options?.matchTriggerWidth) {
			contentElement.style.width = `${triggerElementDimensions?.width}px`;

			await nextBrowserTick?.();
			await nextBrowserTick?.();
		}

		const contentElementDimensions =
			contentElement?.getBoundingClientRect?.();

		// Step 2: Based on the required x-alignment, set horizontal style
		if (xAlign === 'left') {
			position['left'] = 0;
		}

		if (xAlign === 'right') {
			position['left'] =
				triggerElementDimensions?.width -
				contentElementDimensions?.width;
		}

		if (xAlign === 'center') {
			position['left'] =
				(triggerElementDimensions?.width -
					contentElementDimensions?.width) /
				2.0;
		}

		const offsetX = triggerElementDimensions?.width * (xOffset / 100.0);
		position['left'] += offsetX;

		// Step 3: Based on required y-alignment, set vertical style
		if (yAlign === 'top')
			position['top'] = 0 - contentElementDimensions?.height;

		if (yAlign === 'bottom') {
			position['top'] = triggerElementDimensions?.height;
		}

		if (yAlign === 'middle') {
			position['top'] =
				(triggerElementDimensions?.height -
					contentElementDimensions?.height) /
				2.0;
		}

		const offsetY = triggerElementDimensions?.height * (yOffset / 100.0);
		position['top'] += offsetY;

		this.#debug?.(
			`_contentPositionCalculator::options: `,
			options,
			`\n_contentPositionCalculator::position: `,
			position
		);

		return position;
	}

	_fireEvent(name) {
		this.#debug?.(`_fireEvent: ${name}`);
		if (!this.#element) return;

		const thisEvent = new CustomEvent(name, {
			detail: {
				id: this.#element?.id,
				status: {
					open: this?.open,
					disabled: this?.disabled
				}
			}
		});

		this.#element?.dispatchEvent?.(thisEvent);
	}

	_setupInitState() {
		const status = {
			id: this.#element?.id,
			disabled: this?.disabled,
			open: this?.open
		};

		this.#debug?.(`_setupInitState: `, status);
		if (!this.#element) return;

		if (this.#triggerElement) {
			this.#triggerElement?.controls?.setDropdownStatus?.(status);
		}

		if (this.#contentElement) {
			this.#contentElement?.controls?.setDropdownStatus?.(status);
		}
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
		trigger: 'mdc-abstract-dropdown/trigger',
		content: 'mdc-abstract-dropdown/content'
	};
	// #endregion

	// #region Private Attributes
	#debug = debugLogger('component:mdc-abstract-dropdown');

	#element = null;
	#contentElement = null;
	#triggerElement = null;
	// #endregion
}
