import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

export default class MdcBackdropComponent extends Component {
	// #region Accessed Services
	// #endregion

	// #region Tracked Attributes
	// #endregion

	// #region Untracked Public Fields
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.#debug?.(`constructor`);
	}
	// #endregion

	// #region Lifecycle Hooks
	// #endregion

	// #region DOM Event Handlers
	// #endregion

	// #region Modifier Callbacks
	// #endregion

	// #region Controls
	// #endregion

	// #region Computed Properties
	get positionClass() {
		return this?.args?.fullScreen ? 'fixed' : 'absolute';
	}
	// #endregion

	// #region Private Methods
	// #endregion

	// #region Default Sub-components
	// #endregion

	// #region Private Attributes
	#debug = debugLogger('component:mdc-backdrop');
	// #endregion
}
