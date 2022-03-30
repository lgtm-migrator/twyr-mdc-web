import Modifier from 'ember-modifier';
import debugLogger from 'ember-debug-logger';

export default class OnArgsChangeModifier extends Modifier {
	// #region Accessed Services
	// #endregion

	// #region Tracked Attributes
	// #endregion

	// #region Untracked Public Fields
	// #endregion

	// #region Constructor / Destructor
	constructor() {
		super(...arguments);
		this.#debug?.(`constructor`);
	}
	// #endregion

	// #region Lifecycle Hooks
	modify(element, [callback]) {
		super.modify(...arguments);
		this.#debug?.(`modify:\nelement: `, element, `\ncallback: `, callback);

		callback?.();
	}
	// #endregion

	// #region DOM Event Handlers
	// #endregion

	// #region Computed Properties
	// #endregion

	// #region Private Methods
	// #endregion

	// #region Private Attributes
	#debug = debugLogger('modifier:on-args-change');
	// #endregion
}
