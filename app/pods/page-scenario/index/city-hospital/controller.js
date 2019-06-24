import Controller from '@ember/controller';
import { computed } from '@ember/object';

export default Controller.extend({
	salesGroupValue: 0,
	currentSalesConfigs: computed('model.{currentHospitalConfig}', function () {
		let hospitalId = this.model.currentHospitalConfig.get('hospital.id'),
			salesConfigs = this.model.salesConfigs,
			lastSeasonHospitalSalesReports = this.model.lastSeasonHospitalSalesReports,
			currentSalesConfigs = salesConfigs.filterBy('destConfig.hospitalConfig.hospital.id', hospitalId),
			currentHospitaLastSeasonlSalesReports = lastSeasonHospitalSalesReports.filterBy('destConfig.hospitalConfig.hospital.id', hospitalId);

		return currentSalesConfigs.map(ele => {
			let productId = ele.get('goodsConfig.productConfig.product.id'),
				currentProductReport = currentHospitaLastSeasonlSalesReports.findBy('goodsConfig.productConfig.product.id', productId);

			return {
				goodsConfig: ele.goodsConfig,
				patientCount: ele.patientCount,
				hospitalSalesReport: currentProductReport
			};
		});
	}),
	actions: {
		changeSalesValue(city, index) {
			this.set('salesGroupValue', index);
			this.set('model.city', city.city);
			this.set('model.currentHospitalConfig', city.hospitalConfigs.firstObject);

		},
		changeHospital(hospitalConfig) {
			this.set('model.currentHospitalConfig', hospitalConfig);
		}
	}
});
