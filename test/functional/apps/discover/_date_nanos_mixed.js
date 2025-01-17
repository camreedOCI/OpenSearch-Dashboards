/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Any modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import expect from '@osd/expect';

export default function ({ getService, getPageObjects }) {
  const opensearchArchiver = getService('opensearchArchiver');
  const PageObjects = getPageObjects(['common', 'timePicker', 'discover']);
  const opensearchDashboardsServer = getService('opensearchDashboardsServer');
  const security = getService('security');
  const fromTime = 'Jan 1, 2019 @ 00:00:00.000';
  const toTime = 'Jan 1, 2019 @ 23:59:59.999';

  describe('date_nanos_mixed', function () {
    before(async function () {
      await opensearchArchiver.loadIfNeeded('date_nanos_mixed');
      await opensearchDashboardsServer.uiSettings.replace({
        defaultIndex: 'timestamp-*',
        'discover:v2': false,
      });
      await security.testUser.setRoles([
        'opensearch_dashboards_admin',
        'opensearch_dashboards_date_nanos_mixed',
      ]);
      await PageObjects.common.navigateToApp('discover');
      await PageObjects.timePicker.setAbsoluteRange(fromTime, toTime);
    });

    after(async () => {
      await security.testUser.restoreDefaults();
      opensearchArchiver.unload('date_nanos_mixed');
    });

    it('shows a list of records of indices with date & date_nanos fields in the right order', async function () {
      const rowData1 = await PageObjects.discover.getDocTableIndex(1);
      expect(rowData1.startsWith('Jan 1, 2019 @ 12:10:30.124000000')).to.be.ok();
      const rowData2 = await PageObjects.discover.getDocTableIndex(3);
      expect(rowData2.startsWith('Jan 1, 2019 @ 12:10:30.123498765')).to.be.ok();
      const rowData3 = await PageObjects.discover.getDocTableIndex(5);
      expect(rowData3.startsWith('Jan 1, 2019 @ 12:10:30.123456789')).to.be.ok();
      const rowData4 = await PageObjects.discover.getDocTableIndex(7);
      expect(rowData4.startsWith('Jan 1, 2019 @ 12:10:30.123000000')).to.be.ok();
    });
  });
}
