import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
	localClassNames: 'hospital-config',
	classNames: ['pt-3'],
	patientCount: computed('salesConfigs', 'overallFilterData', function() {
		const { salesConfigs, overallFilterData } = this;

		let hospitalId = overallFilterData.get('hospitalConfig.hospital.id'),
			currentSalesConfigs = salesConfigs.filterBy('destConfig.hospitalConfig.hospital.id', hospitalId),
			patientCount = currentSalesConfigs.reduce((acc, cur) => acc + cur.patientCount, 0)

		return patientCount;
	}),
});
