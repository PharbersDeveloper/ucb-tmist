import Controller from '@ember/controller';
import ENV from 'ucb-tmist/config/environment';
import { inject as service } from '@ember/service';
// import { isEmpty } from '@ember/utils';
// import { all, reject } from 'rsvp';
// import { A } from '@ember/array';

export default Controller.extend({
	// axios: service(),
	ajax: service(),
	cookies: service(),
	serviceCycle: service(),
	isHistory: localStorage.getItem('isHistory'),
	actions: {
		continueTest() {
			// window.location = ENV.redirectUri;
			this.transitionToRoute('page-scenario');
		},
		checkManagerReport(paper) {
			// this.model.detailPaper.get('assessmentReports').then(res => {
			// 	this.transitionToRoute('page-report', res.get('id'));
			// });
			this.transitionToRoute('page-report', paper.get('id'));
		},
		outputData(type) {
			const applicationAdapter = this.store.adapterFor('application'),
				{ ajax } = this;

			let version = `${applicationAdapter.get('namespace')}`;

			ajax.request(`${version}/GenerateCSV`, {
				method: 'POST',
				data: JSON.stringify({
					'paper-id': this.model.curPaper.get('id'),
					'account-id': this.get('cookies').read('account_id'),
					'download-type': type
				})
			});
		}
	}
});
