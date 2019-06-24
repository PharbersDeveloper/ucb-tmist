import Controller from '@ember/controller';
// import { alias } from '@ember/object/computed';
import { computed } from '@ember/object';
// import { isEmpty } from '@ember/utils';
import { A } from '@ember/array';
import ENV from 'ucb-tmist/config/environment';

export default Controller.extend({
	// notice: localStorage.getItem('notice') !== 'false',
	neverShow: A(['不在显示']),
	reports: computed('model.detailPaper', function () {
		let paper = this.get('model.detailPaper'),
			inputs = paper.get('paperinputs');

		return inputs.sortBy('time').reverse();
	}),
	entryMission(proposalId) {
		let now = new Date().getTime();

		if (this.get('model').detailPaper.state !== 1) {
			localStorage.setItem('paperStartTime', now);
		}
		this.transitionToRoute('page-scenario', proposalId);
	},
	actions: {
		startDeploy(proposalId) {
			// localStorage.setItem('notice', false);

			this.entryMission(proposalId);
			// this.transitionToRoute('page-notice', proposalId);
		},
		reDeploy() {
			let paper = this.get('model.detailPaper');
			// proposalId = this.get('model').detailProposal.get('proposal.id');

			paper.set('state', 3);
			paper.save().then(res => {
				window.console.log(res);
				window.location = ENV.redirectUri;
			});

			// this.set('reDeploy', false);
			// // reDeploy 为 1 的时候，代表用户选择`重新部署`
			localStorage.setItem('reDeploy', 1);
			// this.entryMission(proposalId);

			// this.transitionToRoute('page-notice', proposalId);
		}
	}
});
