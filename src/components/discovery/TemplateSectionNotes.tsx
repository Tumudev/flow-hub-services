
import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TemplateSectionNotesProps {
  sections: string[];
  initialNotes: string;
  onChange: (fullNotes: string) => void;
}

const TemplateSectionNotes: React.FC<TemplateSectionNotesProps> = ({ 
  sections, 
  initialNotes,
  onChange
}) => {
  // Parse the initialNotes to extract section content
  const parseInitialNotes = (): Record<string, string> => {
    const sectionContent: Record<string, string> = {};
    
    // Initialize with empty content for all sections
    sections.forEach(section => {
      sectionContent[section] = '';
    });
    
    // If there are no initial notes, return the empty sections
    if (!initialNotes) return sectionContent;
    
    try {
      let remainingNotes = initialNotes;
      
      // Parse each section from the notes
      sections.forEach(section => {
        const sectionHeader = `## ${section}`;
        const sectionStart = remainingNotes.indexOf(sectionHeader);
        
        if (sectionStart !== -1) {
          // Extract from after the header to the next section or end
          const contentStart = sectionStart + sectionHeader.length;
          let contentEnd = remainingNotes.length;
          
          // Look for the next section header
          const nextSectionIndex = sections.findIndex((nextSection, idx) => {
            const nextHeader = `## ${nextSection}`;
            const nextPos = remainingNotes.indexOf(nextHeader, contentStart);
            return idx > sections.indexOf(section) && nextPos !== -1;
          });
          
          if (nextSectionIndex !== -1) {
            const nextHeader = `## ${sections[nextSectionIndex]}`;
            contentEnd = remainingNotes.indexOf(nextHeader, contentStart);
          }
          
          // Extract the content and trim whitespace
          const content = remainingNotes.substring(contentStart, contentEnd).trim();
          sectionContent[section] = content;
        }
      });
      
      return sectionContent;
    } catch (error) {
      console.error('Error parsing notes:', error);
      return sectionContent;
    }
  };
  
  const [sectionNotes, setSectionNotes] = useState<Record<string, string>>(parseInitialNotes());
  
  const handleSectionChange = (section: string, content: string) => {
    const updatedNotes = { ...sectionNotes, [section]: content };
    setSectionNotes(updatedNotes);
    
    // Combine all sections into a single Markdown string
    const combinedNotes = sections.map(sect => `## ${sect}\n${updatedNotes[sect] || ''}`).join('\n\n');
    onChange(combinedNotes);
  };
  
  return (
    <div className="space-y-4">
      {sections.map((section, index) => (
        <Card key={index}>
          <CardHeader className="py-3">
            <CardTitle className="text-lg">{section}</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={sectionNotes[section] || ''}
              onChange={(e) => handleSectionChange(section, e.target.value)}
              placeholder={`Enter notes for ${section}...`}
              className="min-h-[120px] w-full"
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TemplateSectionNotes;
