import Controller from '@ember/controller';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { A } from '@ember/array';

export default Controller.extend({
	filterTableData: computed('model.tableData', 'tmpRep', function () {
		let tableData = this.get('model.tableData'),
			tmpRep = this.get('tmpRep'),
			filterTableData = A([]);

		if (isEmpty(tmpRep)) {
			return tableData;
		}
		filterTableData = tableData.filterBy('representative', tmpRep.get('name'));
		return filterTableData;
	})
});
