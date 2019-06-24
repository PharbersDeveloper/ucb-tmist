import Route from '@ember/routing/route';
import { isEmpty } from '@ember/utils';
import { A } from '@ember/array';
import { hash, all } from 'rsvp';

export default Route.extend({
	queryDeep(salesReport) {
		let result = A([]);

		return salesReport.get('hospitalSalesReports')
			.then(data => {
				result = data;
				return all(data.map(ele => ele.get('destConfig')));
			}).then(data => {
				return all(data.map(ele => ele.get('hospitalConfig')));
			}).then(data => {
				return all(data.map(ele => ele.get('hospital')));
			}).then(() => {
				return all(result.map(ele => ele.get('goodsConfig')));
			}).then(data => {
				return all(data.map(ele => ele.get('productConfig')));
			}).then(data => {
				return all(data.map(ele => ele.get('product')));
			}).then(() => {
				return result;
			});
	},
	model() {
		const pageScenarioModel = this.modelFor('page-scenario'),
			{ salesReports } = pageScenarioModel,
			scenario = pageScenarioModel.scenario,
			salesConfigs = pageScenarioModel.salesConfigs,
			lastSeasonHospitalSalesReports = pageScenarioModel.lastSeasonHospitalSalesReports,
			paper = pageScenarioModel.paper,
			resourceConfigRepresentatives = pageScenarioModel.resourceConfRep,
			store = this.get('store'),
			that = this;

		let businessinputs = store.peekAll('businessinput'),
			tableData = A([]),
			tableDataAll = A([]),
			usableSeasons = A([]),
			handleUsableSeasons = A([]),
			currentSalesReports = A([]),
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
				return paper.get('paperinputs');
			}).then(data => {
				usableSeasons = data.filter(ele => ele.get('phase') > 0).sortBy('phase');

				handleUsableSeasons = usableSeasons.map(ele => {
					return {
						id: ele.get('scenario.id'),
						phase: ele.get('scenario.phase'),
						name: ele.get('scenario.name')
					};
				});
				handleUsableSeasons.push({
					id: scenario.get('id'),
					phase: scenario.get('phase'),
					name: scenario.get('name')
				});
				return all(salesReports.slice(-handleUsableSeasons.length).map(ele => {
					return that.queryDeep(ele);
				}));
			}).then(data => {
				currentSalesReports = data;

				// if (usableSeasons.length === 0) {
				// 	return [{
				// 		businput: businessinputs,
				// 		scenarioId: scenario.get('id')
				// 	}];
				// }
				return all(usableSeasons.map(ele => {
					return hash({
						businput: ele.get('businessinputs'),
						scenarioId: ele.get('scenario.id')
					});
				}));
			}).then(data => {
				data.push({
					businput: businessinputs,
					scenarioId: scenario.get('id')
				});
				tableData = data.map((item, index) => {
					let scenarioId = item.scenarioId,
						detailData = A([]);

					detailData = item.businput.map(ele => {
						let biHospitalId = ele.get('destConfig.hospitalConfig.hospital.id'),
							currentSalesConfig = salesConfigs.findBy('destConfig.hospitalConfig.hospital.id', biHospitalId),
							sales = 0,
							firstProduct = goodsConfigs.firstObject,
							currentSeasonHospitalSalesReport = currentSalesReports[index],
							currentHospitalSalesReports = currentSeasonHospitalSalesReport.filterBy('destConfig.hospitalConfig.hospital.id', biHospitalId),
							currentReport = currentHospitalSalesReports.findBy('goodsConfig.productConfig.product.id', firstProduct.get('productConfig.product.id'));

						sales = currentReport.get('sales');

						return {
							scenarioId,
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

					return {
						scenarioId,
						data: detailData
					};
				});
			}).then(() => {
				return hash({
					handleUsableSeasons,
					usableSeasons,
					salesConfigs,
					resourceConfigRepresentatives,
					tableData,
					tableDataAll,
					businessinputs,
					goodsConfigs: pageScenarioModel.goodsConfigs.filter(ele => ele.get('productConfig.productType') === 0)
				});
			});
	},
	setupController(controller, model) {
		this._super(...arguments);
		controller.set('tmpGc', model.goodsConfigs.get('firstObject'));
		controller.set('tmpSeason', model.handleUsableSeasons.get('lastObject'));
	}
});
