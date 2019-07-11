import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { A } from '@ember/array';
import { hash, all } from 'rsvp';

export default Route.extend({
	cookies: service(),
	statusService: service(),
	// converse: service('serviceConverse'),
	/**
	 * 判断是否有 businessinput
	 * @param  {model} scenario
	 * @param  {model} paper
	 * @param  {model} destConfigHospitals
	 * @param  {model} selfGoodsConfigs
	 */
	isHaveBusinessInput(paper, destConfigHospitals, selfGoodsConfigs, lastSeasonHospitalSalesReports = []) {
		let state = paper.get('state'),
			paperInputs = paper.get('paperinputs'),
			reDeploy = Number(localStorage.getItem('reDeploy')) === 1,
			exitInEmberData = this.get('store').peekAll('businessinput');

		if ([1, 4].indexOf(state) >= 0 && !reDeploy || exitInEmberData.get('length') > 0) {
			return paperInputs.lastObject.get('businessinputs');
			// return this.get('store').peekAll('businessinput');
		}
		return this.generateBusinessInputs(destConfigHospitals, selfGoodsConfigs, lastSeasonHospitalSalesReports);
	},
	/**
	 * 生成 businessinputs
	 * @param  {model} destConfigHospitals
	 * @param  {model} selfGoodsConfigs
	 */
	generateBusinessInputs(destConfigHospitals, selfGoodsConfigs, lastSeasonHospitalSalesReports) {
		let promiseArray = A([]),
			store = this.get('store');

		promiseArray = destConfigHospitals.map(ele => {
			let goodsInputs = selfGoodsConfigs.map(item => {
					return store.createRecord('goodsinput', {
						destConfigId: ele.get('id'),
						goodsConfig: item,
						salesTarget: '',	// 销售目标设定
						budget: ''	//预算设定
					// TODO 测试，用后删除
					// salesTarget: 1,	// 销售目标设定
					// budget: 1	//预算设定
					});
				}),
				businessinput = null;

			if (isEmpty(lastSeasonHospitalSalesReports)) {
				return store.createRecord('businessinput', {
					destConfig: ele,
					destConfigId: ele.id,
					representativeId: '',
					resourceConfigId: '',
					resourceConfig: null,
					salesTarget: '',
					budget: '',
					// goodsConfigs: selfGoodsConfigs,
					goodsinputs: goodsInputs,
					meetingPlaces: '',
					visitTime: ''
				});
			}
			lastSeasonHospitalSalesReports.uniqBy('destConfig.hospitalConfig.hospital.id').forEach(element => {
				if (element.get('destConfig.hospitalConfig.hospital.id') === ele.get('hospitalConfig.hospital.id')) {
					businessinput = store.createRecord('businessinput', {
						destConfig: ele,
						destConfigId: ele.id,
						representativeId: element.get('resourceConfig.representativeConfig.representative.id'),
						resourceConfigId: element.get('resourceConfig.id'),
						resourceConfig: element.get('resourceConfig'),
						salesTarget: '',
						budget: '',
						// goodsConfigs: selfGoodsConfigs,
						goodsinputs: goodsInputs,
						meetingPlaces: '',
						visitTime: ''
					});
				}
			});
			return businessinput;
		});
		return promiseArray;
	},
	model() {
		const store = this.get('store'),
			cookies = this.get('cookies'),
			pageIndexModel = this.modelFor('index'),
			// { resourceConfigRepresentatives } = pageIndexModel,
			// scenarioId = scenario.get('id'),
			// proposalId = params['proposal_id'];
			// paper = pageIndexModel.detailPaper;
			proposalId = localStorage.getItem('proposalId');

		let { detailProposal, destConfigs, destConfigRegions } = pageIndexModel,
			resourceConfigRepresentatives = A([]),
			destConfigHospitals = A([]),
			resourceConfigManager = A([]),
			goodsConfigs = A([]),
			scenario = null,
			scenarioId = '',
			paper = null,
			proposal = null,
			businessInputs = null,
			lastSeasonHospitalSalesReports = A([]),
			navs = A([
				{ name: '产品销售报告', route: 'page-scenario.index.performance' },
				{ name: '地区销售报告', route: 'page-scenario.index.region' },
				{ name: '代表销售报告', route: 'page-scenario.index.representative' },
				{ name: '医院销售报告', route: 'page-scenario.index.hospital' }
			]),
			barLineKeys = A([
				{ name: '销售额', key: 'sales' },
				{ name: '指标', key: 'salesQuota' },
				{ name: '指标达成率', key: 'quotaAchievement' }
			]),
			tmpHeadQ = A([]),
			selfGoodsConfigs = A([]),
			competeGoodsConfigs = A([]),
			increaseSalesReports = A([]),
			goodsInputs = A([]),
			goodsInputsModel = A([]),
			managerConfig = null;

		store.unloadAll('businessinput');

		return detailProposal.get('proposal')
			.then(data => {
				proposal = data;
				return store.query('scenario', {
					'proposal-id': proposal.get('id'),
					'account-id': cookies.read('account_id')
				}, { reload: true });
			}).then(data => {
				scenario = data.get('firstObject');
				scenarioId = scenario.get('id');
				this.statusService.set('curScenario', scenario);
				this.statusService.set('curScenarioId', scenarioId);
				return store.query('paper', {
					'paper-id': this.statusService.get('genPaperId'),
					// 'proposal-id': proposal.get('id'),
					// 'account-id': cookies.read('account_id'),
					'chart-type': 'hospital-sales-report-summary'
				}, { reload: true });
			}).then(data => {
				paper = data.get('firstObject');
				return store.query('goodsConfig', { 'scenario-id': scenarioId });
			}).then(data => {
				goodsConfigs = data;
				return store.queryRecord('resourceConfig',
					{
						'scenario-id': scenarioId,
						'resource-type': 0
					});
			}).then(data => {
				resourceConfigManager = data;
				return store.query('destConfig',
					{
						'scenario-id': scenarioId,
						'dest-type': 1
					});
			}).then(data => {
				destConfigHospitals = data;
				return store.query('resourceConfig',
					{
						'scenario-id': scenarioId,
						'resource-type': 1
					});
			}).then(data => {
				resourceConfigRepresentatives = data;
				return paper.get('salesReports');
			}).then(data => {
				increaseSalesReports = data.sortBy('time');
				let salesReport = increaseSalesReports.get('lastObject');

				return all([increaseSalesReports.map(ele => {
					return ele.get('scenario');
				}), salesReport.get('hospitalSalesReports')]);

				// return salesReport.get('hospitalSalesReports');
			}).then(data => {
				tmpHeadQ = data[0].map(ele => {
					let name = ele.get('name');

					return name;
				});

				lastSeasonHospitalSalesReports = data[1].sortBy('potential').reverse();

				if (scenario.get('phase') > 1) {
					return all(lastSeasonHospitalSalesReports.map(ele => ele.get('destConfig')));
				}
				return null;
			}).then(data => {
				if (isEmpty(data)) {
					return null;
				}
				return all(data.map(ele => ele.get('hospitalConfig')));
			}).then(data => {
				if (isEmpty(data)) {
					return null;
				}
				return all(data.map(ele => ele.get('hospital')));
			}).then(data => {
				if (isEmpty(data)) {
					return null;
				}
				return all(lastSeasonHospitalSalesReports.map(ele => ele.get('resourceConfig')));

			}).then(data => {
				if (isEmpty(data)) {
					return null;
				}
				return all(data.map(ele => ele.get('representativeConfig')));

			}).then(data => {
				if (isEmpty(data)) {
					return null;
				}
				return all(data.map(ele => ele.get('representative')));

			}).then(data => {
				if (isEmpty(data)) {
					return null;
				}
				return all(destConfigHospitals.map(ele => ele.get('hospitalConfig')));
			}).then(data => {
				if (isEmpty(data)) {
					return null;
				}
				return all(data.map(ele => ele.get('hospital')));

			}).then(() => {
				return destConfigHospitals.map(ele => ele);
			}).then(data => {
				selfGoodsConfigs = goodsConfigs.filter(ele => ele.get('productConfig.productType') === 0);
				competeGoodsConfigs = goodsConfigs.filter(ele => ele.get('productConfig.productType') === 1);

				if (scenario.get('phase') > 1) {
					businessInputs = this.isHaveBusinessInput(paper, data, selfGoodsConfigs, lastSeasonHospitalSalesReports);
				} else {
					businessInputs = this.isHaveBusinessInput(paper, data, selfGoodsConfigs);
				}
				return resourceConfigManager.get('managerConfig');
			}).then(data => {
				managerConfig = data;
				let isNewBusinessInputs = businessInputs.every(ele => ele.isNew),
					businessInputsId = businessInputs.map(ele => ele.id);

				if (isNewBusinessInputs) {
					return all(businessInputs.map(ele => ele.get('goodsinputs')));
				}
				return all(businessInputsId.map(ele => store.findRecord('businessinput', ele)));
			}).then(data => {
				goodsInputsModel = data;
				let isNewBusinessInputs = businessInputs.every(ele => ele.isNew),
					goodsinputsIds = A([]);

				if (isNewBusinessInputs) {
					goodsInputs = data.reduce((acc, cur) => {
						let inside = cur.reduce((iacc, icur) => iacc.concat(icur), []);

						return acc.concat(inside);
					}, []);
					return goodsInputs;
				}
				data.forEach(ele => {
					ele.get('goodsinputs').forEach(item => {
						goodsinputsIds.push(item.id);
					});
				});
				return all(goodsinputsIds.map(ele => store.findRecord('goodsinput', ele)));

			}).then(data => {
				goodsInputs = data;
				return all(destConfigHospitals.map(ele => ele.get('hospitalConfig')));
			}).then(data => {
				return all(data.map(ele => ele.get('hospital')));
			}).then(() => {
				return hash({
					businessInputs,
					goodsInputs,
					goodsInputsModel,
					tmpHeadQ,
					barLineKeys,
					increaseSalesReports,
					detailProposal,
					resourceConfigRepresentatives,
					navs,
					proposal,
					paper,
					// detailPaper,
					scenario,
					// detailPaperState: paper.get('state'),
					resourceConfRep: pageIndexModel.resourceConfigRepresentatives,
					resourceConfigManager: resourceConfigManager,
					managerGoodsConfigs: managerConfig.get('managerGoodsConfigs'),
					goodsConfigs,
					selfGoodsConfigs,
					competeGoodsConfigs,
					destConfigs,
					destConfigHospitals,
					destConfigRegions,
					salesReports: increaseSalesReports,
					lastSeasonHospitalSalesReports,
					resourceConfig: store.query('resourceConfig',
						{ 'scenario-id': scenarioId }),
					salesConfigs: store.query('salesConfig',
						{
							'scenario-id': scenarioId,
							'proposal-id': proposalId,
							'account-id': cookies.read('account_id')
						})
				});
			});
	},
	afterModel(model) {
		let applicationController = this.controllerFor('application');

		applicationController.set('testProgress', 2);
		applicationController.setProperties({
			proposal: model.proposal,
			scenario: model.scenario,
			paper: model.paper,
			businessInputs: model.businessInputs,
			goodsInputs: model.goodsInputs
		});
	},
	setupController(controller, model) {
		this._super(...arguments);
		// let converse = this.converse;

		controller.set('businessInputs', model.businessInputs);
		controller.set('loading', false);
		controller.set('indexController', this.controllerFor('index'));
		// controller.set('notice', true);

		// if ([0, 2, 3].indexOf(model.paper.state) >= 0) {
		if (localStorage.getItem('noticeFlag') === 'true') {
			controller.set('notice', true);
		} else {
			controller.set('notice', false);
		}
		// }
		// if (!controller.get('hasPlugin')) {
		// converse.initialize();

		// 	window.converse.plugins.add('chat_plugin', {
		// 		initialize: function () {
		// 			controller.set('hasPlugin', true);
		// 			this._converse.api.listen.on('message', obj => {
		// 				let message = isEmpty(obj.stanza.textContent) ? '{}' : obj.stanza.textContent;

		// 				window.console.log(JSON.parse(message).msg);
		// 				if (!isEmpty(message)) {
		// 					controller.set('xmppMessage', JSON.parse(message));
		// 					return JSON.parse(message);
		// 				}
		// 			});
		// 		}
		// 	});
		// }
	},
	activate() {
		this._super(...arguments);
		let controller = this.controllerFor('page-scenario');

		controller.set('loading', false);
		if (localStorage.getItem('noticeFlag') === 'true') {
			controller.set('notice', true);
		} else {
			controller.set('notice', false);
		}
	}
});
