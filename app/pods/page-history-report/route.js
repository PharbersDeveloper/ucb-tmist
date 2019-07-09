import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
// import { isEmpty } from '@ember/utils';
// import { A } from '@ember/array';
// import { all, hash } from 'rsvp';

export default Route.extend({
	cookies: service(),

	model() {
		const cookies = this.get('cookies'),
			indexModel = this.modelFor('index'),
			{ detailProposal } = indexModel;

		// let paper = this.store.query('paper', {
		// 		'account-id': cookies.read('account_id')
		// 	}),
		// 	assessmentReports = A([]);

		return this.store.query('paper', {
			'account-id': cookies.read('account_id'),
			'proposal-id': detailProposal.get('proposal.id'),
			'query-type': 'assessment'
		}).then(data => {
			return data.sortBy('time').reverse();
		});
		// return paper.then(data => {
		// 	return all(data.map(ele => ele.get('assessmentReports')));
		// }).then(data => {
		// 	data.forEach(ele => {
		// 		if (ele.length > 0) {
		// 			assessmentReports.pushObject(ele.firstObject);
		// 		}
		// 	});
		// 	return hash({
		// 		assessmentReports
		// 	});
		// });
	}
});
