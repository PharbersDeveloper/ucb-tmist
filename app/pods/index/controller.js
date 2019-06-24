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
	// assignHospitals: alias('restManagerResource.assignHospitals'),
	// assignRepresentatives: alias('restManagerResource.assignRepresentatives'),
	// usedBudget: alias('restManagerResource.usedBudget'),
	// goodsSalesTargets: alias('restManagerResource.goodsSalesTargets'),

	// restManagerResource: computed('model.{paperinput}', function () {
	// 	const model = this.get('model'),
	// 		{ paperinput, businessInputs, selfProductConfigs } = model;

	// 	let usedSalesTarget = 0,
	// 		usedBudget = 0,
	// 		assignHospitalArray = A([]),
	// 		assignRepresentativeArray = A([]);

	// 	if (isEmpty(paperinput)) {
	// 		return {
	// 			assignHospitals: assignHospitalArray.get('length'),
	// 			assignRepresentatives: assignRepresentativeArray.get('length'),
	// 			usedBudget,
	// 			usedSalesTarget,
	// 			goodsSalesTargets: selfProductConfigs.map(ele => {
	// 				return {
	// 					productConfig: ele,
	// 					salesTarget: 0,
	// 					budget: 0
	// 				};
	// 			})
	// 		};
	// 	}

	// 	businessInputs.forEach(bi => {
	// 		if (!isEmpty(bi.get('resourceConfig'))) {
	// 			assignHospitalArray.push(bi.get('resourceConfig'));
	// 		}
	// 		usedSalesTarget += Number(bi.get('totalSalesTarget'));
	// 		usedBudget += Number(bi.get('totalBudget'));
	// 	});
	// 	if (assignHospitalArray.get('length') !== 0) {
	// 		let businessinputRepresentatives = assignHospitalArray.map(ele => ele.get('resourceConfig.representativeConfig.representative.id'));

	// 		assignRepresentativeArray = businessinputRepresentatives.uniq().filter(item => item);
	// 	}
	// 	return {
	// 		assignHospitals: assignHospitalArray.get('length'),
	// 		assignRepresentatives: assignRepresentativeArray.get('length'),
	// 		usedBudget,
	// 		usedSalesTarget,
	// 		goodsSalesTargets: []
	// 	};
	// }),
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
			// if (this.model.scenario.phase > 1) {
			// 	this.set('fromFirstPhase', true);
			// } else {
			this.entryMission(proposalId);
			// }
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
		},
		fromFirstPhase(paperId) {
			this.store.findRecord('paper', paperId, { reload: true })
				.then(data => {
					data.set('state', 3);
					return data.save();
				}).then(() => {
					window.location = ENV.redirectUri;
					return null;
				});
		}
	}
});
