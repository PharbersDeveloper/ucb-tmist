import Controller from '@ember/controller';
import ENV from 'ucb-tmist/config/environment';

export default Controller.extend({
	actions: {
		continueTest() {
			window.location = ENV.redirectUri;
		},
		checkManagerReport() {
			this.transitionToRoute('page-report');
		}
	}
});
