import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { A } from '@ember/array';
import { hash } from 'rsvp';

export default Route.extend({
	cookies: service(),
	/**
	 * 判断是否有 businessinput
	 * @param  {model} scenario
	 * @param  {model} paper
	 * @param  {model} destConfigs
	 * @param  {model} selfGoodsConfigs
	 */
	isHaveBusinessInput(paper, destConfigs, selfGoodsConfigs, lastSeasonHospitalSalesReports = []) {
		let state = paper.get('state'),
			reDeploy = Number(localStorage.getItem('reDeploy')) === 1,
			exitInEmberData = this.get('store').peekAll('businessinput');

		//	[1,4].indexOf(state)>=0
		if ([1, 4].indexOf(state) >= 0 && !reDeploy || exitInEmberData.get('length') > 0) {
			return this.get('store').peekAll('businessinput');
		}
		return this.generateBusinessInputs(destConfigs, selfGoodsConfigs, lastSeasonHospitalSalesReports);
	},
	/**
	 * 生成 businessinputs
	 * @param  {model} destConfigs
	 * @param  {model} selfGoodsConfigs
	 */
	generateBusinessInputs(destConfigs, selfGoodsConfigs, lastSeasonHospitalSalesReports) {
		let promiseArray = A([]),
			store = this.get('store');

		promiseArray = destConfigs.map(ele => {
			let goodsInputs = selfGoodsConfigs.map(item => {
				return store.createRecord('goodsinput', {
					destConfigId: ele.get('id'),
					goodsConfig: item,
					// salesTarget: '',	// 销售目标设定
					// budget: ''	//预算设定
					// TODO 测试，用后删除
					salesTarget: 75000,	// 销售目标设定
					budget: 42500	//预算设定
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
			scenario = pageIndexModel.scenario,
			scenarioId = scenario.get('id'),
			proposalId = params['proposal_id'],
			paper = pageIndexModel.detailPaper;

		let { detailProposal, destConfigs, goodsConfigs } = pageIndexModel,
			proposal = null,
			businessInputs = null,
			salesReports = A([]),
			lastSeasonHospitalSalesReports = A([]);

		return detailProposal.get('proposal')
			.then(data => {
				proposal = data;
				return data.get('salesReports');
			}).then(data => {
				salesReports = data.sortBy('time');
				let salesReport = salesReports.get('lastObject');

				return salesReport.get('hospitalSalesReports');
			}).then(data => {
				lastSeasonHospitalSalesReports = data.sortBy('potential').reverse();

				return destConfigs.map(ele => ele);
			}).then(data => {
				let selfGoodsConfigs = goodsConfigs.filter(ele => ele.get('productConfig.productType') === 0),
					competeGoodsConfigs = goodsConfigs.filter(ele => ele.get('productConfig.productType') === 1);

				if (scenario.get('phase') > 1) {
					businessInputs = this.isHaveBusinessInput(paper, data, selfGoodsConfigs, lastSeasonHospitalSalesReports);
				} else {
					businessInputs = this.isHaveBusinessInput(paper, data, selfGoodsConfigs);
				}
				return hash({
					proposal,
					businessInputs,
					paper,
					scenario,
					paperState: paper.get('state'),
					resourceConfRep: pageIndexModel.resourceConfigRepresentatives,
					resourceConfManager: pageIndexModel.resourceConfigManager,
					goodsConfigs,
					selfGoodsConfigs,
					competeGoodsConfigs,
					destConfigs,
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
			paper: model.paper
		});
	},
	setupController(controller, model) {
		this._super(...arguments);
		controller.set('businessInputs', model.businessInputs);

		if ([0, 2, 3].indexOf(model.paper.state) >= 0) {
			controller.set('notice', true);
		}
	}
});
