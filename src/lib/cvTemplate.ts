import {
  AlignmentType,
  BorderStyle,
  Document,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import type { FormattedCv } from "./formattedCvTypes";

const HEADING_COLOR = "000000";
const BODY_SIZE = 22; // half-points → 11pt
const NAME_SIZE = 32;
const HEADLINE_SIZE = 24;

function contactLine(cv: FormattedCv): string {
  const parts = [
    cv.contact.email,
    cv.contact.phone,
    cv.contact.location,
    cv.contact.linkedin,
    cv.contact.website,
  ].filter(Boolean);
  return parts.join("  |  ");
}

function sectionHeading(title: string): Paragraph {
  return new Paragraph({
    spacing: { before: 280, after: 120 },
    border: {
      bottom: { color: "CBD5E1", size: 6, style: BorderStyle.SINGLE, space: 4 },
    },
    children: [
      new TextRun({
        text: title.toUpperCase(),
        bold: true,
        size: 22,
        color: HEADING_COLOR,
        font: "Calibri",
      }),
    ],
  });
}

function bodyParagraph(text: string, options?: { spacingAfter?: number }): Paragraph {
  return new Paragraph({
    spacing: { after: options?.spacingAfter ?? 120 },
    children: [
      new TextRun({
        text,
        size: BODY_SIZE,
        font: "Calibri",
      }),
    ],
  });
}

function bulletParagraph(text: string): Paragraph {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 80 },
    children: [
      new TextRun({
        text,
        size: BODY_SIZE,
        font: "Calibri",
      }),
    ],
  });
}

export async function buildFormattedCvDocx(cv: FormattedCv): Promise<Blob> {
  const children: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: cv.name,
          bold: true,
          size: NAME_SIZE,
          font: "Calibri",
        }),
      ],
    }),
  ];

  if (cv.headline) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: cv.headline,
            italics: true,
            size: HEADLINE_SIZE,
            color: "475569",
            font: "Calibri",
          }),
        ],
      })
    );
  }

  const contact = contactLine(cv);
  if (contact) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: contact,
            size: 20,
            color: "64748B",
            font: "Calibri",
          }),
        ],
      })
    );
  }

  if (cv.summary) {
    children.push(sectionHeading("Professional Summary"));
    children.push(bodyParagraph(cv.summary));
  }

  if (cv.experience.length > 0) {
    children.push(sectionHeading("Experience"));
    for (const role of cv.experience) {
      const titleLine = [role.title, role.company].filter(Boolean).join(" — ");
      const meta = [role.dates, role.location].filter(Boolean).join("  |  ");
      children.push(
        new Paragraph({
          spacing: { before: 160, after: 40 },
          children: [
            new TextRun({ text: titleLine, bold: true, size: BODY_SIZE, font: "Calibri" }),
          ],
        })
      );
      if (meta) {
        children.push(
          new Paragraph({
            spacing: { after: 80 },
            children: [
              new TextRun({
                text: meta,
                italics: true,
                size: 20,
                color: "64748B",
                font: "Calibri",
              }),
            ],
          })
        );
      }
      for (const bullet of role.bullets) {
        children.push(bulletParagraph(bullet));
      }
    }
  }

  if (cv.education.length > 0) {
    children.push(sectionHeading("Education"));
    for (const edu of cv.education) {
      const line = [edu.degree, edu.institution].filter(Boolean).join(" — ");
      children.push(bodyParagraph(line, { spacingAfter: 40 }));
      const meta = [edu.dates, edu.details].filter(Boolean).join("  |  ");
      if (meta) {
        children.push(bodyParagraph(meta, { spacingAfter: 120 }));
      }
    }
  }

  if (cv.skills.length > 0) {
    children.push(sectionHeading("Skills"));
    for (const group of cv.skills) {
      const detail = group.items.join(", ");
      children.push(
        new Paragraph({
          spacing: { after: 100 },
          children: detail
            ? [
                new TextRun({
                  text: `${group.category}: `,
                  bold: true,
                  size: BODY_SIZE,
                  font: "Calibri",
                }),
                new TextRun({
                  text: detail,
                  size: BODY_SIZE,
                  font: "Calibri",
                }),
              ]
            : [
                new TextRun({
                  text: group.category,
                  bold: true,
                  size: BODY_SIZE,
                  font: "Calibri",
                }),
              ],
        })
      );
    }
  }

  if (cv.certifications && cv.certifications.length > 0) {
    children.push(sectionHeading("Certifications"));
    for (const cert of cv.certifications) {
      children.push(bulletParagraph(cert));
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, right: 720, bottom: 720, left: 720 },
          },
        },
        children,
      },
    ],
  });

  return Packer.toBlob(doc);
}

export function formattedCvFilename(slug: string, name: string): string {
  const safeName = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return `kigho-${slug}-${safeName || "cv"}.docx`;
}
