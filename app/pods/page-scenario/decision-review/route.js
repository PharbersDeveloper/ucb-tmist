import Route from '@ember/routing/route';
import { isEmpty } from '@ember/utils';
import { A } from '@ember/array';
import { hash, all } from 'rsvp';

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
			usableSeasons = A([]),
			handleUsableSeasons = A([]),
			goodsConfigs = pageScenarioModel.goodsConfigs.filter(ele => ele.get('productConfig.productType') === 0);

		return all(businessinputs.map(ele => {
			if (!isEmpty(ele)) {
				ele.get('resourceConfig');
			}
		}))
			.then(data => {
				return all(data.map(ele => {
					if (!isEmpty(ele)) {
						ele.get('representativeConfig');
					}
				}));
			}).then(data => {
				return all(data.map(ele => {
					if (!isEmpty(ele)) {
						ele.get('representative');
					}
				}));
			}).then(() => {
				return all(lastSeasonHospitalSalesReports.map(ele => ele.get('destConfig')));
			}).then(data => {
				return all(data.map(ele => ele.get('hospitalConfig')));
			}).then(data => {
				return all(data.map(ele => ele.get('hospital')));
			}).then(() => {
				tableData = businessinputs.map(ele => {
					let biHospitalId = ele.get('destConfig.hospitalConfig.hospital.id'),
						currentSalesConfig = salesConfigs.findBy('destConfig.hospitalConfig.hospital.id', biHospitalId),
						sales = 0,
						firstProduct = goodsConfigs.firstObject,
						currentHospitalSalesReports = lastSeasonHospitalSalesReports.filterBy('destConfig.hospitalConfig.hospital.id', biHospitalId),
						currentReport = currentHospitalSalesReports.findBy('goodsConfig.productConfig.product.id', firstProduct.get('productConfig.product.id'));

					sales = currentReport.get('sales');

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
						goodsInputs: ele.get('goodsinputs'),
						lastSeasonProductSales: currentHospitalSalesReports
					};
				});
				return paper.get('paperinputs');

			}).then(data => {
				return data.filter(ele => ele.get('phase') > 0);
			}).then(data => {
				usableSeasons = data;
				let tmpArr = A([]);

				usableSeasons.forEach(ele => {
					let phaseObj = {
						id: ele.id,
						name: ele.get('scenario.name')
					};

					tmpArr.pushObject(phaseObj);
				});
				tmpArr.pushObject({
					id: 0,
					name: '当前周期'
				});
				handleUsableSeasons = tmpArr;
			}).then(() => {
				return hash({
					handleUsableSeasons,
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
