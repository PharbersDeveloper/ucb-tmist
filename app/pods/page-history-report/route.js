import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
// import { isEmpty } from '@ember/utils';
import { A } from '@ember/array';
import { all, hash } from 'rsvp';

export default Route.extend({
	cookies: service(),

	model() {
		const cookies = this.get('cookies');

		let paper = this.store.query('paper', {
				'account-id': cookies.read('account_id')
			}),
			assessmentReports = A([]);

		return paper.then(data => {
			return all(data.map(ele => ele.get('assessmentReports')));
		}).then(data => {
			data.forEach(ele => {
				if (ele.length > 0) {
					assessmentReports.pushObject(ele.firstObject);
				}
			});
			// 	window.console.log(assessmentReports);
			// 	return all(assessmentReports.map(ele => ele.get('simplifyResult.levelConfig.level')));
			// }).then(data => {
			return hash({
				assessmentReports
			});
		});
	}
});
