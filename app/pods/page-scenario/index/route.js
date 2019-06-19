import Route from '@ember/routing/route';
import { A } from '@ember/array';
import RSVP, { hash, all } from 'rsvp';

export default Route.extend({
	eachArray(array, key) {
		return array.map(ele => {
			return ele.get(key);
		});
	},
	beforeModel(transition) {
		let proposalId = transition.params['page-scenario']['proposal_id'],
			currentChindRouteName = transition.targetName.split('.').get('lastObject'),
			currentController = this.controllerFor('page-scenario.index');

		currentController.set('proposalId', proposalId);
		currentController.set('groupValue', currentChindRouteName);
	},
	model() {
		const pageScenarioModel = this.modelFor('page-scenario'),
			{ paper, goodsConfigs, navs, scenario } = pageScenarioModel;

		let seasons = A([]),
			tmpData = A([]),
			productConfigs = A([]),
			tmpHead = A([]),
			lineColorTm = A(['#57D9A3', '#79E2F2', '#FFE380', '#8777D9 ']);

		return paper.get('salesReports')
			.then(data => {
				// 获取产品salesReport
				let increaseSalesReports = data.sortBy('time'),
					promiseArray = increaseSalesReports.map(ele => {
						return ele.get('productSalesReports');
					}),
					seasonsPrimary = increaseSalesReports.map(ele => {
						return ele.get('scenario');
					}),
					repPromiseArray = increaseSalesReports.map(ele => {
						return ele.get('representativeSalesReports');
					}),
					hospPromiseArray = increaseSalesReports.map(ele => {
						return ele.get('hospitalSalesReports');
					});


				return hash({
					productSalesReports: RSVP.Promise.all(promiseArray),
					seasons: RSVP.Promise.all(seasonsPrimary),
					representativeSalesReports: RSVP.Promise.all(repPromiseArray),
					hospitalSalesReports: RSVP.Promise.all(hospPromiseArray)
				});


			}).then(result => {
				let promiseArray = A([]),
					data = result.productSalesReports;

				tmpHead = result.seasons.map(ele => {
					let name = ele.get('name') || '';

					return name;
					// return name.slice(0, 4) + name.slice(-4);
				});
				// 获取基于周期的数据
				tmpData = data.map((productSalesReports, index) => {
					let shareData = this.eachArray(productSalesReports, 'share'),
						goodsConfigIds = productSalesReports.map(ele => ele.get('goodsConfig')),
						productNames = this.eachArray(productSalesReports, 'productName');

					promiseArray = goodsConfigIds;
					return {
						date: seasons[index],
						shareData,
						goodsConfigIds,
						productNames
					};
				});

				return RSVP.Promise.all(promiseArray);
				// return hash({
				// 	goodsConfigIds: RSVP.Promise.all(promiseArray),
				// 	resourceConfigIds: RSVP.Promise.all(repPromiseArray),
				// 	destConfigIds: RSVP.Promise.all(hospPromiseArray)
				// });
			}).then(data => {
				let promiseArray = data.map(ele => {
					return ele.get('productConfig');
				});

				// repPromiseArray = data.resourceConfigIds.map(ele => {
				// 	return ele.get('representativeConfig');
				// }),
				// hospPromiseArray = data.destConfigIds.map(ele => {
				// 	return ele.get('hospitalConfig');
				// });

				return all(promiseArray);
				// return hash({
				// 	productConfig: RSVP.Promise.all(promiseArray),
				// 	representativeConfig: RSVP.Promise.all(repPromiseArray),
				// 	hospitalConfig: RSVP.Promise.all(hospPromiseArray)
				// });
			}).then(data => {
				productConfigs = data;
				let promiseArray = data.map(ele => ele.get('product'));

				// repPromiseArray = data.representativeConfig.map(ele => {
				// 	return ele.get('representative');
				// }),
				// hospPromiseArray = data.hospitalConfig.map(ele => {
				// 	return ele.get('hospital');
				// });

				return all(promiseArray);
				// return hash({
				// 	productConfig: RSVP.Promise.all(promiseArray),
				// 	representativeConfig: RSVP.Promise.all(repPromiseArray),
				// 	hospitalConfig: RSVP.Promise.all(hospPromiseArray)
				// });
			}).then(data => {
				// 拼装基于产品的数据
				let lineData = data.map((gc, index) => {
					return {
						name: gc.get('name'),
						treatmentArea: productConfigs[index].get('treatmentArea'),
						date: tmpHead,
						data: tmpData.map(item => item.shareData[index])
					};
				});

				return hash({
					navs,
					paper,
					goodsConfigs,
					scenario,
					selfGoodsConfigs: pageScenarioModel.selfGoodsConfigs,
					competeGoodsConfigs: pageScenarioModel.competeGoodsConfigs,
					destConfigHospitals: pageScenarioModel.destConfigHospitals,
					salesConfigs: pageScenarioModel.salesConfigs,
					resourceConfRep: pageScenarioModel.resourceConfRep,
					resourceConfigManager: pageScenarioModel.resourceConfigManager,
					lineData,
					lineColorTm,
					treatmentArea: lineData.uniqBy('treatmentArea')
				});
			});
	},
	setupController(controller, model) {
		this._super(...arguments);
		controller.set('notice', true);
		controller.set('productTreatmentArea', model.treatmentArea.firstObject);
	}
	// beforeModel(transition) {
	// 	let resourceConfig = this.modelFor('page-scenario'),
	// 		destConfigHospitals = resourceConfig.destConfigHospitals,
	// 		firstDestConfig = destConfigHospitals.get('firstObject'),
	// 		proposalId = transition.params['page-scenario']['proposal_id'];

	// 	this.transitionTo('/scenario/' + proposalId + '/index/hospital/' +
	// 		firstDestConfig.get('id'));
	// },
	// model() {
	// 	let pageScenarioModel = this.modelFor('page-scenario'),
	// 		destConfigHospitals = pageScenarioModel.destConfigHospitals,
	// 		goodsConfigs = pageScenarioModel.goodsConfigs,
	// 		businessInputs = pageScenarioModel.businessInputs,
	// 		resourceConfRep = pageScenarioModel.resourceConfRep;

	// 	this.controllerFor('page-scenario.index').set('businessInputs', businessInputs);
	// 	this.controllerFor('page-scenario').set('businessInputs', businessInputs);

	// 	return hash({
	// 		businessInputs: businessInputs,
	// 		resourceConfigManager: pageScenarioModel.resourceConfigManager,
	// 		goodsConfigs,
	// 		destConfigHospitals,
	// 		resourceConfRep,
	// 		salesConfigs: pageScenarioModel.salesConfigs
	// 	});
	// }
});