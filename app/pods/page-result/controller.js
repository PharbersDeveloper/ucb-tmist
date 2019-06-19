import Controller from '@ember/controller';
import ENV from 'ucb-tmist/config/environment';
import { inject as service } from '@ember/service';

export default Controller.extend({
	cookies: service(),
	serviceCycle: service(),
	actions: {
		continueTest() {
			// let pageIndexModel = this.modelFor('index');

			window.location = ENV.redirectUri;

			// this.transitionToRoute('index');
			// this.serviceCycle.set('needRefresh', true);
			// this.serviceCycle.set('needRedirectToSce', true);
		},
		checkManagerReport() {
			this.transitionToRoute('page-report');
		}
	}
});
