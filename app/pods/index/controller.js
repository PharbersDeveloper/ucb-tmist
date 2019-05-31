import Controller from '@ember/controller';
import { alias } from '@ember/object/computed';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { A } from '@ember/array';

export default Controller.extend({
	notice: localStorage.getItem('notice') !== 'false',
	neverShow: A(['不在显示']),
	reports: computed('model.detailPaper', function () {
		let paper = this.get('model.detailPaper'),
			inputs = paper.get('paperinputs');

		return inputs.sortBy('time').reverse();
	}),
	assignHospitals: alias('restManagerResource.assignHospitals'),
	assignRepresentatives: alias('restManagerResource.assignRepresentatives'),
	usedBudget: alias('restManagerResource.usedBudget'),
	goodsSalesTargets: alias('restManagerResource.goodsSalesTargets'),

	restManagerResource: computed('model.{paperinput}', function () {
		const model = this.get('model'),
			{ paperinput, businessInputs, selfProductConfigs } = model;

		let usedSalesTarget = 0,
			usedBudget = 0,
			assignHospitalArray = A([]),
			assignRepresentativeArray = A([]);

		if (isEmpty(paperinput)) {
			return {
				assignHospitals: assignHospitalArray.get('length'),
				assignRepresentatives: assignRepresentativeArray.get('length'),
				usedBudget,
				usedSalesTarget,
				goodsSalesTargets: selfProductConfigs.map(ele => {
					console.log(ele.get('product.id'));
					return {
						productConfig: ele,
						salesTarget: 0,
						budget: 0
					};
				})
			};
		}

		businessInputs.forEach(bi => {
			if (!isEmpty(bi.get('resourceConfig'))) {
				assignHospitalArray.push(bi.get('resourceConfig'));
			}
			usedSalesTarget += Number(bi.get('totalSalesTarget'));
			usedBudget += Number(bi.get('totalBudget'));
		});
		if (assignHospitalArray.get('length') !== 0) {
			let businessinputRepresentatives = assignHospitalArray.map(ele => ele.get('resourceConfig.representativeConfig.representative.id'));

			assignRepresentativeArray = businessinputRepresentatives.uniq().filter(item => item);
		}
		return {
			assignHospitals: assignHospitalArray.get('length'),
			assignRepresentatives: assignRepresentativeArray.get('length'),
			usedBudget,
			usedSalesTarget,
			goodsSalesTargets: []
		};
	}),
	entryMission(proposalId) {
		let now = new Date().getTime();

		if (this.get('model').detailPaper.state !== 1) {
			localStorage.setItem('paperStartTime', now);
		}
		this.transitionToRoute('page-scenario', proposalId);
	},
	actions: {
		changeDetail(useableProposal, paper) {
			this.set('model.detailProposal', useableProposal);
			this.set('model.detailPaper', paper);
		},
		startDeploy(proposalId) {
			localStorage.setItem('notice', false);
			this.entryMission(proposalId);
			// this.transitionToRoute('page-notice', proposalId);
		},
		reDeploy() {
			let proposalId = this.get('model').detailProposal.get('proposal.id');

			this.set('reDeploy', false);
			// reDeploy 为 1 的时候，代表用户选择`重新部署`
			localStorage.setItem('reDeploy', 1);
			this.entryMission(proposalId);

			// this.transitionToRoute('page-notice', proposalId);
		},
		closeNotice() {
			this.set('notice', false);
		},
		chooseItem(item) {
			if (item.length > 0) {
				localStorage.setItem('notice', false);
			} else {
				localStorage.setItem('notice', true);
			}
		}
	}
});
