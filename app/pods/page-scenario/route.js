import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { A } from '@ember/array';
import { hash, all } from 'rsvp';

export default Route.extend({
	cookies: service(),
	/**
	 * 判断是否有 businessinput
	 * @param  {model} scenario
	 * @param  {model} detailPaper
	 * @param  {model} destConfigHospitals
	 * @param  {model} selfGoodsConfigs
	 */
	isHaveBusinessInput(detailPaper, destConfigHospitals, selfGoodsConfigs, lastSeasonHospitalSalesReports = []) {
		let state = detailPaper.get('state'),
			paperInputs = detailPaper.get('paperinputs'),
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
					// salesTarget: 70,	// 销售目标设定
					// budget: 4	//预算设定
				});
			});

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
			lastSeasonHospitalSalesReports.forEach(element => {
				if (element.get('destConfig.hospitalConfig.hospital.id') === ele.get('hospitalConfig.hospital.id')) {
					return store.createRecord('businessinput', {
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
		});
		return promiseArray;
	},
	model(params) {
		const store = this.get('store'),
			cookies = this.get('cookies'),
			pageIndexModel = this.modelFor('index'),
			{ detailPaper, scenario, resourceConfigRepresentatives, goodsConfigs } = pageIndexModel,
			scenarioId = scenario.get('id'),
			proposalId = params['proposal_id'],
			paper = pageIndexModel.detailPaper;

		let { detailProposal, destConfigs, destConfigHospitals, destConfigRegions } = pageIndexModel,
			proposal = null,
			businessInputs = null,
			salesReports = A([]),
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
			increaseSalesReports = A([]),
			tmpHead = A([]),
			tmpHeadQ = A([]),
			selfGoodsConfigs= A([]),
			competeGoodsConfigs= A([]),
			managerConfig = null;

		return detailProposal.get('proposal')
			.then(data => {
				proposal = data;
				return data.get('salesReports');
			}).then(data => {
				increaseSalesReports = data.sortBy('time');
				let salesReport = increaseSalesReports.get('lastObject');

				return all([increaseSalesReports.map(ele => {
					return ele.get('scenario');
				}), salesReport.get('hospitalSalesReports')]);

				// return salesReport.get('hospitalSalesReports');
			}).then(data => {
				tmpHead = data[0].map(ele => {
					let name = ele.get('name');

					return name;
					// return name.slice(0, 4) + name.slice(-4);
				});
				// tmpHeadQ = tmpHead.map(ele => {
				// 	return this.seasonQ(ele);
				// });
				tmpHeadQ = tmpHead.map(ele => ele);
				lastSeasonHospitalSalesReports = data[1].sortBy('potential').reverse();

				return destConfigHospitals.map(ele => ele);
			}).then(data => {
					selfGoodsConfigs = goodsConfigs.filter(ele => ele.get('productConfig.productType') === 0);
					competeGoodsConfigs = goodsConfigs.filter(ele => ele.get('productConfig.productType') === 1);

				if (scenario.get('phase') > 1) {
					businessInputs = this.isHaveBusinessInput(detailPaper, data, selfGoodsConfigs, lastSeasonHospitalSalesReports);
				} else {
					businessInputs = this.isHaveBusinessInput(detailPaper, data, selfGoodsConfigs);
				}
				return pageIndexModel.resourceConfigManager.get('managerConfig');
			}).then(data=> {
				managerConfig = data;
				return all( businessInputs.map(ele=>ele.get('goodsinputs')));
			}).then(data=> {
				let totalGoodsInputs = data.reduce((acc,cur)=> {
					let inside = cur.reduce((iacc,icur)=> iacc.concat(icur),[]);

					return acc.concat(inside);
				},[]);

				return hash({
					businessInputs,
					goodsInputs: totalGoodsInputs,
					tmpHead,
					tmpHeadQ,
					barLineKeys,
					increaseSalesReports,
					detailProposal,
					resourceConfigRepresentatives,
					navs,
					proposal,
					paper,
					detailPaper,
					scenario,
					detailPaperState: detailPaper.get('state'),
					resourceConfRep: pageIndexModel.resourceConfigRepresentatives,
					resourceConfigManager: pageIndexModel.resourceConfigManager,
					managerGoodsConfigs: managerConfig.get('managerGoodsConfigs'),
					goodsConfigs,
					selfGoodsConfigs,
					competeGoodsConfigs,
					destConfigs,
					destConfigHospitals,
					destConfigRegions,
					salesReports,
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
			detailPaper: model.detailPaper
		});
	},
	setupController(controller, model) {
		this._super(...arguments);
		controller.set('businessInputs', model.businessInputs);

		if ([0, 2, 3].indexOf(model.detailPaper.state) >= 0) {
			controller.set('notice', true);
		}
	},
	seasonQ(seasonText) {
		let season = isEmpty(seasonText) ? '' : seasonText;

		if (season === '') {
			return season;
		}
		season = season.replace('第一季度', 'Q1');
		season = season.replace('第二季度', 'Q2');
		season = season.replace('第三季度', 'Q3');
		season = season.replace('第四季度', 'Q4');

		return season;
	}
});
