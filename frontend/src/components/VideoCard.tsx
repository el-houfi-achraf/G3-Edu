import Link from 'next/link';
import Image from 'next/image';
import { VideoListItem } from '@/types';

interface VideoCardProps {
  video: VideoListItem;
  index?: number;
}

export default function VideoCard({ video, index = 0 }: VideoCardProps) {
  return (
    <Link 
      href={`/videos/${video.id}`} 
      className="group block"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="glass rounded-2xl overflow-hidden card-hover">
        {/* Thumbnail Container */}
        <div className="relative aspect-video overflow-hidden">
          {/* Thumbnail Image */}
          <Image
            src={video.thumbnail_url || '/placeholder.jpg'}
            alt={video.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1a] via-transparent to-transparent opacity-80" />
          
          {/* Gold accent on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#d4a853]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="play-btn w-16 h-16 gradient-gold rounded-full flex items-center justify-center shadow-2xl">
              <svg className="w-7 h-7 text-[#0a0f1a] ml-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            </div>
          </div>
          
          {/* Duration badge */}
          <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-[#0a0f1a]/80 rounded-md text-xs text-white font-medium backdrop-blur-sm border border-[#d4a853]/30">
            Cours
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Category badge */}
          {video.category_name && (
            <span className="badge badge-gold mb-3">
              {video.category_name}
            </span>
          )}
          
          {/* Title */}
          <h3 className="font-semibold text-white text-lg mb-2 line-clamp-2 group-hover:text-[#d4a853] transition-colors">
            {video.title}
          </h3>
          
          {/* Description */}
          {video.description && (
            <p className="text-slate-400 text-sm line-clamp-2 mb-4">
              {video.description}
            </p>
          )}
          
          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-[#d4a853]/10">
            <div className="flex items-center gap-2 text-slate-500 text-xs">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {new Date(video.created_at).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </div>
            <span className="text-[#d4a853] text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
              Voir
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
        
        {/* Gold accent line at bottom */}
        <div className="h-1 w-0 group-hover:w-full bg-gradient-to-r from-[#d4a853] to-[#f5d78e] transition-all duration-300" />
      </div>
    </Link>
  );
}
