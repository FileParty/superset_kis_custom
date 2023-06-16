/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { t } from '@superset-ui/core';
import { addWarningToast } from 'src/components/MessageToasts/actions';
import kebabCase from 'lodash/kebabCase';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * generate a consistent file stem from a description and date
 *
 * @param description title or description of content of file
 * @param date date when file was generated
 */
const generateFileStem = (description: string, date = new Date()) =>
  `${kebabCase(description)}-${date.toISOString().replace(/[: ]/g, '-')}`;
/**
 * Create an event handler for turning an element into an pdf
 *
 * @param selector css selector of the parent element which should be turned into pdf
 * @param description name or a short description of what is being printed.
 *   Value will be normalized, and a date as well as a file extension will be added.
 * @param isExactSelector if false, searches for the closest ancestor that matches selector.
 * @returns event handler
 */
export default function downloadAsPDF(selector: string, description: string) {
  const elementToPrint = document.querySelector(selector);
  console.log(elementToPrint);
  if (!elementToPrint) {
    addWarningToast(t('PDF download failed, please refresh and try again.'));
  }
  html2canvas(document.querySelector(selector)!).then(canvas => {
    const imgData = canvas.toDataURL('image/png');
    // A4
    const imgWidth = 200;
    const pageHeight = imgWidth * 1.414;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight - pageHeight;
    const doc = new jsPDF('p', 'mm', 'A4');
    let position = 10;
    doc.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    while (heightLeft >= 10) {
      position = heightLeft - imgHeight + 5;
      doc.addPage();
      doc.addImage(imgData, 'PNG', 5, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    doc.save(`${generateFileStem(description)}.pdf`);
  });
}
