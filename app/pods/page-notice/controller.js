import Controller from '@ember/controller';
// import { alias } from '@ember/object/computed';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';

export default Controller.extend({
	usedResource: computed('model.paperinput', function () {
		if (isEmpty(this.model.paperinput)) {
			return {
				arrangedHospital: 0,
				arrangedRepresentative: 0,
				assignedBudgets: 0,
				assignedMedicines: 0
			};
		}
	}),
	// restManagerTime: alias('restManagerResource.restTime'),
	// restManagerKpi: alias('restManagerResource.restKpi'),
	// usedBudget: alias('restManagerResource.usedBudget'),
	// usedSalesTarget: alias('restManagerResource.usedSalesTarget'),
	// restManagerResource: computed('model.{managerInput,representativeInputs,businessInputs}', 'totalTime', 'totalKpi', function () {
	// 	const model = this.get('model'),
	// 		paperinput = model.paperinput,
	// 		managerInput = model.managerInput,
	// 		businessInputs = model.businessInputs,
	// 		representativeInputs = model.representativeInputs;

	// 	let usedManagerTime = 0,
	// 		usedManagerKpi = 0,
	// 		usedSalesTarget = 0,
	// 		usedBudget = 0;

	// 	if (isEmpty(paperinput)) {
	// 		return {
	// 			restTime: this.get('totalTime'),
	// 			restKpi: this.get('totalKpi'),
	// 			usedBudget,
	// 			usedSalesTarget
	// 		};
	// 	}
	// 	usedManagerTime = managerInput.get('totalManagerUsedTime');

	// 	representativeInputs.forEach(ele => {
	// 		usedManagerTime += Number(ele.get('abilityCoach'));
	// 		usedManagerTime += Number(ele.get('assistAccessTime'));
	// 		usedManagerKpi += Number(ele.get('totalPoint'));
	// 	});
	// 	businessInputs.forEach(bi => {
	// 		usedSalesTarget += Number(bi.get('salesTarget'));
	// 		usedBudget += Number(bi.get('budget'));
	// 	});
	// 	return {
	// 		restTime: this.get('totalTime') - usedManagerTime,
	// 		restKpi: this.get('totalKpi') - usedManagerKpi,
	// 		usedBudget,
	// 		usedSalesTarget
	// 	};
	// }),
	actions: {
		entryMission(proposalId) {
			let now = new Date().getTime();

			if (this.get('model').detailPaper.state !== 1) {
				localStorage.setItem('paperStartTime', now);
			}
			this.transitionToRoute('page-scenario');
		}
	}
});
