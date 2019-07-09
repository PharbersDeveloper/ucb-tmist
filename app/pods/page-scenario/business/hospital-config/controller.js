import Controller from '@ember/controller';
import { computed } from '@ember/object';
// import { isEmpty } from '@ember/utils';
// import { A } from '@ember/array';
import EmberObject from '@ember/object';


export default Controller.extend({
	// numberVerify: /^-?[1-9]\d*$/,
	// IndicatorAllocationPercent: computed('businessinput.salesTarget', function () {
	// 	let { totalBusinessIndicators, businessinput } =
	// 		this.getProperties('totalBusinessIndicators', 'businessinput'),
	// 		salesTarget = businessinput.get('salesTarget'),
	// 		verify = this.numberVerify,
	// 		illegal = verify.test(salesTarget);

	// 	if (!illegal && salesTarget !== '') {
	// 		return {
	// 			illegal: true,
	// 			percent: 0
	// 		};
	// 	}
	// 	return {
	// 		illegal: false,
	// 		percent: isEmpty(totalBusinessIndicators) ? 0 : (salesTarget * 100 / totalBusinessIndicators).toFixed(2)
	// 	};
	// }),
	// budgetPercent: computed('businessinput.budget', function () {
	// 	let { totalBudgets, businessinput } =
	// 		this.getProperties('totalBudgets', 'businessinput'),
	// 		budget = businessinput.get('budget'),
	// 		verify = this.numberVerify,
	// 		illegal = verify.test(budget);

	// 	if (!illegal && budget !== '') {
	// 		return {
	// 			illegal: true,
	// 			percent: 0
	// 		};
	// 	}
	// 	return {
	// 		illegal: false,
	// 		percent: isEmpty(totalBudgets) ? 0 : (budget * 100 / totalBudgets).toFixed(2)
	// 	};
	// }),
	lastSales: computed('model.destConfig', function () {
		const { destConfig, salesConfigs, lastSeasonHospitalSalesReports } = this.model;

		let hospitalId = destConfig.get('hospitalConfig.hospital.id'),
			currentHospitalSalesReports = lastSeasonHospitalSalesReports.filterBy('destConfig.hospitalConfig.hospital.id', hospitalId);

		return salesConfigs.map(ele => {
			return {
				goodsConfig: ele.get('goodsConfig'),
				report: currentHospitalSalesReports.findBy('goodsConfig.productConfig.product.id', ele.get('goodsConfig.productConfig.product.id'))
			};
		});

	}),
	actions: {
		numberWarning() {
			let warning = EmberObject.create();

			warning.open = true;
			warning.title = '非法值警告';
			warning.detail = '请输入数字！';
			this.set('warning', warning);
		},
		changedRep(item) {
			let businessinput = this.get('businessinput');

			this.set('tmpRc', item);
			businessinput.setProperties({
				resourceConfigId: item.id,
				resourceConfig: item
			});
		},
		reInput() {
			let businessinput = this.get('businessinput'),
				goodsInputs = businessinput.get('goodsinputs'),
				phase = this.model.scenario.get('phase');

			goodsInputs.forEach(goodsInput => {
				goodsInput.setProperties({
					salesTarget: '',	// 销售目标设定
					budget: ''
				});
			});
			if (phase === 1) {
				this.set('tmpRc', null);

				businessinput.setProperties({
					resourceConfigId: '',
					resourceConfig: null
				});
			}

		}
	}
});
