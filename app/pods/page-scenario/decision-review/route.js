import Route from '@ember/routing/route';
import { isEmpty } from '@ember/utils';
import { A } from '@ember/array';
import { hash } from 'rsvp';

export default Route.extend({
	model() {
		const pageScenarioModel = this.modelFor('page-scenario'),
			salesConfigs = pageScenarioModel.salesConfigs,
			lastSeasonHospitalSalesReports = pageScenarioModel.lastSeasonHospitalSalesReports,
			paper = pageScenarioModel.paper,
			resourceConfigRepresentatives = pageScenarioModel.resourceConfRep,
			store = this.get('store');

		let businessinputs = store.peekAll('businessinput'),
			tableData = A([]),
			usableSeasons = A([]);

		tableData = businessinputs.map(ele => {
			let biHospitalId = ele.get('destConfig.hospitalConfig.hospital.id'),
				currentSalesConfig = salesConfigs.findBy('destConfig.hospitalConfig.hospital.id', biHospitalId),
				sales = 0;

			lastSeasonHospitalSalesReports.forEach(item => {
				let dataHosopitalId = item.get('destConfig.hospitalConfig.hospital.id');

				if (dataHosopitalId === biHospitalId) {
					sales = item.get('sales');
				}
			});

			return {
				hospitalName: ele.get('destConfig.hospitalConfig.hospital.name'),
				hospitalLevel: ele.get('destConfig.hospitalConfig.hospital.hospitalLevel'),
				patientNumber: Number.prototype.toLocaleString.call(currentSalesConfig.get('patientCount')),
				sales: sales,
				representative: isEmpty(ele.get('resourceConfig.representativeConfig.representative.name')) ? '-' : ele.get('resourceConfig.representativeConfig.representative.name'),
				totalSalesTarget: isEmpty(ele.get('totalSalesTarget')) ? '-' : ele.get('totalSalesTarget'),
				salesTarget: isEmpty(ele.get('totalSalesTarget')) ? '-' : ele.get('totalSalesTarget'),
				totalBudget: isEmpty(ele.get('totalBudget')) ? '-' : ele.get('totalBudget'),
				budget: isEmpty(ele.get('totalBudget')) ? '-' : ele.get('totalBudget'),
				goodsInputs: ele.get('goodsinputs')
			};
		});
		return paper.get('paperinputs')
			.then(data => {
				return data.filter(ele => ele.get('phase') > 0);
			})
			.then(data => {
				usableSeasons = data;
			}).then(() => {
				return hash({
					usableSeasons,
					salesConfigs,
					resourceConfigRepresentatives,
					tableData,
					businessinputs,
					goodsConfigs: pageScenarioModel.goodsConfigs.filter(ele => ele.get('productConfig.productType') === 0)
				});
			});
	},
	setupController(controller, model) {
		this._super(...arguments);
		controller.set('tmpGc', model.goodsConfigs.get('firstObject'));
		// controller.set('tmpSr', A([]));
	}
});
