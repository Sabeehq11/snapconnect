import { supabase } from '../../lib/supabase';

export const findEmptyFiles = async () => {
  try {
    console.log('🔍 Searching for empty files in storage...');
    
    // List all files in the media bucket
    const { data: files, error } = await supabase.storage
      .from('media')
      .list('', {
        limit: 1000,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      console.error('❌ Error listing files:', error);
      return { error: error.message };
    }

    console.log(`📁 Found ${files.length} files in root directory`);

    // Also check user subdirectories
    const allFiles = [...files];
    const userFolders = files.filter(file => file.name && !file.name.includes('.'));
    
    for (const folder of userFolders) {
      try {
        const { data: userFiles, error: userError } = await supabase.storage
          .from('media')
          .list(folder.name, {
            limit: 1000,
            offset: 0
          });

        if (!userError && userFiles) {
          userFiles.forEach(file => {
            allFiles.push({
              ...file,
              fullPath: `${folder.name}/${file.name}`
            });
          });
        }
      } catch (folderError) {
        console.warn(`⚠️ Could not list files in folder ${folder.name}:`, folderError);
      }
    }

    // Filter for actual files (not folders) and check for empty files
    const actualFiles = allFiles.filter(file => 
      file.name && 
      file.name.includes('.') && 
      (file.name.endsWith('.jpg') || file.name.endsWith('.jpeg') || file.name.endsWith('.png'))
    );

    console.log(`📸 Found ${actualFiles.length} image files`);

    // Check file sizes
    const emptyFiles = actualFiles.filter(file => file.metadata?.size === 0 || file.size === 0);
    const validFiles = actualFiles.filter(file => 
      file.metadata?.size > 0 || (file.size && file.size > 0)
    );

    console.log(`❌ Empty files: ${emptyFiles.length}`);
    console.log(`✅ Valid files: ${validFiles.length}`);

    if (emptyFiles.length > 0) {
      console.log('\n🔍 Sample empty files:');
      emptyFiles.slice(0, 5).forEach((file, index) => {
        console.log(`${index + 1}. ${file.fullPath || file.name} - Size: ${file.metadata?.size || file.size || 0} bytes`);
      });
    }

    return {
      total: actualFiles.length,
      empty: emptyFiles.length,
      valid: validFiles.length,
      emptyFiles: emptyFiles,
      validFiles: validFiles
    };

  } catch (error) {
    console.error('❌ Error in findEmptyFiles:', error);
    return { error: error.message };
  }
};

export const deleteEmptyFiles = async () => {
  try {
    console.log('🗑️ Starting cleanup of empty files...');
    
    const result = await findEmptyFiles();
    if (result.error) {
      throw new Error(result.error);
    }

    if (result.empty === 0) {
      console.log('✅ No empty files found - nothing to clean up!');
      return { deleted: 0, message: 'No empty files found' };
    }

    console.log(`🗑️ Attempting to delete ${result.empty} empty files...`);

    const filesToDelete = result.emptyFiles.map(file => file.fullPath || file.name);
    
    const { data, error } = await supabase.storage
      .from('media')
      .remove(filesToDelete);

    if (error) {
      console.error('❌ Error deleting files:', error);
      throw new Error(`Delete failed: ${error.message}`);
    }

    console.log(`✅ Successfully deleted ${data.length} empty files`);
    return { 
      deleted: data.length, 
      message: `Deleted ${data.length} empty files`,
      deletedFiles: data
    };

  } catch (error) {
    console.error('❌ Error in deleteEmptyFiles:', error);
    return { error: error.message };
  }
};

export const runStorageCleanup = async () => {
  console.log('🧹 Running storage cleanup...');
  console.log('====================================');

  try {
    // Step 1: Find empty files
    const findResult = await findEmptyFiles();
    
    if (findResult.error) {
      throw new Error(findResult.error);
    }

    console.log('\n📊 STORAGE ANALYSIS:');
    console.log('====================================');
    console.log(`📁 Total image files: ${findResult.total}`);
    console.log(`❌ Empty files: ${findResult.empty}`);
    console.log(`✅ Valid files: ${findResult.valid}`);

    if (findResult.empty > 0) {
      console.log('\n🗑️ CLEANUP NEEDED:');
      console.log('====================================');
      console.log(`Found ${findResult.empty} empty files that should be deleted`);
      
      // Step 2: Delete empty files
      const deleteResult = await deleteEmptyFiles();
      
      if (deleteResult.error) {
        throw new Error(deleteResult.error);
      }

      console.log(`✅ Cleanup completed - deleted ${deleteResult.deleted} files`);
      
      return {
        success: true,
        message: `Cleaned up ${deleteResult.deleted} empty files`,
        before: findResult,
        deleted: deleteResult.deleted
      };
    } else {
      console.log('\n✅ No cleanup needed - all files are valid!');
      return {
        success: true,
        message: 'No empty files found - storage is clean',
        before: findResult,
        deleted: 0
      };
    }

  } catch (error) {
    console.error('❌ Storage cleanup failed:', error);
    return {
      success: false,
      message: `Cleanup failed: ${error.message}`,
      error: error.message
    };
  }
}; 