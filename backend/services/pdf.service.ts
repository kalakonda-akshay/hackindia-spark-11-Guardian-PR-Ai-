import PDFDocument from 'pdfkit';
import { Response } from 'express';
import { SessionModel } from '../db/Session.js';

export class PdfService {
  public async generateReport(sessionId: string, res: Response): Promise<void> {
    const session = await SessionModel.findOne({ id: sessionId });
    
    if (!session) {
      throw new Error("Session not found");
    }

    const pr = session.reviewRequest.pullRequest;
    const repo = session.reviewRequest.repository;
    
    const securityFindings = session.contextBundle.security?.findings || [];
    const depVulns = session.contextBundle.dependency?.vulnerabilities || [];
    const riskScore = session.contextBundle.reporter?.overallRiskScore || 0;
    const summary = session.contextBundle.reporter?.executiveSummary || "Scan in progress...";

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    doc.pipe(res);

    // Title Page
    doc.fontSize(28).font('Helvetica-Bold').text('Mutagent Security Report', { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(14).font('Helvetica').text(`Repository: `, { continued: true }).font('Helvetica-Bold').text(`${repo.full_name}`);
    doc.font('Helvetica').text(`Pull Request: `, { continued: true }).font('Helvetica-Bold').text(`#${pr.number} - ${pr.title}`);
    doc.font('Helvetica').text(`Author: `, { continued: true }).font('Helvetica-Bold').text(`${pr.user?.login || repo.owner?.login || 'N/A'}`);
    doc.font('Helvetica').text(`Date: `, { continued: true }).font('Helvetica-Bold').text(`${new Date().toLocaleString()}`);
    doc.moveDown(2);

    // Risk Score
    doc.fontSize(18).font('Helvetica-Bold').text(`Overall Security Score: ${100 - riskScore}/100`, { align: 'center' });
    doc.moveDown(2);

    // Executive Summary
    doc.fontSize(20).font('Helvetica-Bold').text('Executive Summary');
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica').text(summary, { align: 'justify' });
    doc.moveDown(2);

    doc.addPage();

    // Security Findings
    doc.fontSize(20).font('Helvetica-Bold').text('Security Findings');
    doc.moveDown();

    if (securityFindings.length === 0) {
      doc.fontSize(12).font('Helvetica-Oblique').text('No security findings discovered.');
    } else {
      securityFindings.forEach((finding: any, index: number) => {
        doc.fontSize(14).font('Helvetica-Bold').text(`${index + 1}. ${finding.title} [${finding.severity.toUpperCase()}]`);
        doc.fontSize(12).font('Helvetica').text(`Description:`, { continued: true, underline: true }).font('Helvetica').text(` ${finding.description || finding.summary || 'N/A'}`, { underline: false });
        doc.moveDown(0.5);
      });
    }

    doc.moveDown(2);

    // Dependency Vulnerabilities
    doc.fontSize(20).font('Helvetica-Bold').text('Dependency Analysis');
    doc.moveDown();

    if (depVulns.length === 0) {
      doc.fontSize(12).font('Helvetica-Oblique').text('No dependency vulnerabilities discovered.');
    } else {
      depVulns.forEach((vuln: any, index: number) => {
        doc.fontSize(14).font('Helvetica-Bold').text(`${index + 1}. ${vuln.package} [${vuln.severity?.toUpperCase() || 'UNKNOWN'}]`);
        if (vuln.description) {
          doc.fontSize(12).font('Helvetica').text(`Description: ${vuln.description}`);
        }
        doc.moveDown(0.5);
      });
    }

    // Agent Timeline
    doc.addPage();
    doc.fontSize(20).font('Helvetica-Bold').text('Execution Timeline');
    doc.moveDown();

    session.timeline.forEach((event: any) => {
      doc.fontSize(10).font('Helvetica').text(`[${new Date(event.timestamp).toLocaleTimeString()}] ${event.event}: ${event.details?.message || ''}`);
    });

    // Footer on all pages (Optional: PDFKit makes global footers a bit complex without events, so we skip for simplicity, or we could use the 'pageAdded' event)

    doc.end();
  }
}

export const pdfService = new PdfService();
